import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { partnerPhotoService, photoUrl } from '../services/partnerPhotoService';

const MAX_DIMENSION = 1600;
const COMPRESS_QUALITY = 0.78;

let cursor = 0;
function genId() {
  cursor += 1;
  return `up-${Date.now().toString(36)}-${cursor}`;
}

function initialState() {
  return { arrival: [], before: [], after: [] };
}

function inferMime(uri) {
  const lower = (uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/jpeg';
  return 'image/jpeg';
}

/**
 * Manage per-bucket booking photo uploads (before / after).
 *
 * Talks to {@link partnerPhotoService} for real multipart uploads, shows
 * live progress via {@link onProgress}, and supports retry + cancel. Images
 * are compressed locally with `expo-image-manipulator` before upload so the
 * connection cost is bounded even on poor cellular links.
 *
 * @param {string} bookingId
 * @param {{ initial?: { before?: any[], after?: any[] } }} [options]
 */
export default function useJobUploads(bookingId, options = {}) {
  const [buckets, setBuckets] = useState(() => {
    if (options.initial) {
      return {
        arrival: options.initial.arrival || [],
        before: options.initial.before || [],
        after: options.initial.after || [],
      };
    }
    return initialState();
  });
  const controllers = useRef(new Map());

  useEffect(() => {
    const map = controllers.current;
    return () => {
      for (const c of map.values()) {
        try {
          c.abort();
        } catch {
          /* ignore */
        }
      }
      map.clear();
    };
  }, [bookingId]);

  const updateImage = useCallback((bucket, id, patch) => {
    setBuckets((prev) => ({
      ...prev,
      [bucket]: prev[bucket].map((img) => (img.id === id ? { ...img, ...patch } : img)),
    }));
  }, []);

  const compress = useCallback(async (asset) => {
    try {
      const actions = [];
      if (asset.width && asset.width > MAX_DIMENSION) {
        actions.push({ resize: { width: MAX_DIMENSION } });
      } else if (asset.height && asset.height > MAX_DIMENSION) {
        actions.push({ resize: { height: MAX_DIMENSION } });
      }
      const result = await ImageManipulator.manipulateAsync(
        asset.uri,
        actions,
        {
          compress: COMPRESS_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );
      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        type: 'image/jpeg',
      };
    } catch {
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: inferMime(asset.uri),
      };
    }
  }, []);

  const performUpload = useCallback(
    async (bucket, image) => {
      if (!bookingId) {
        updateImage(bucket, image.id, { status: 'failed', error: 'Missing booking id' });
        return;
      }
      const controller = new AbortController();
      controllers.current.set(image.id, controller);
      try {
        const compressed = await compress({
          uri: image.uri,
          width: image.width,
          height: image.height,
        });
        const file = {
          uri:
            Platform.OS === 'ios' && compressed.uri.startsWith('file://')
              ? compressed.uri.replace('file://', '')
              : compressed.uri,
          name: `${bucket}-${image.id}.jpg`,
          type: compressed.type || 'image/jpeg',
        };
        const result = await partnerPhotoService.upload(bookingId, bucket, file, {
          signal: controller.signal,
          onProgress: (frac) => updateImage(bucket, image.id, { progress: frac }),
        });
        controllers.current.delete(image.id);
        updateImage(bucket, image.id, {
          status: 'success',
          progress: 1,
          remoteId: result?.id ?? null,
          remoteUrl: result?.url ? photoUrl(result.url) : null,
        });
      } catch (err) {
        controllers.current.delete(image.id);
        const aborted = err?.message === 'Upload cancelled';
        updateImage(bucket, image.id, {
          status: aborted ? 'cancelled' : 'failed',
          error: err?.message || 'Upload failed',
        });
      }
    },
    [bookingId, compress, updateImage],
  );

  const addAssets = useCallback(
    (bucket, assets) => {
      if (!assets || assets.length === 0) return;
      const newImages = assets.map((asset) => ({
        id: genId(),
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        status: 'uploading',
        progress: 0,
        capturedAt: Date.now(),
      }));
      setBuckets((prev) => ({
        ...prev,
        [bucket]: [...prev[bucket], ...newImages],
      }));
      newImages.forEach((img) => performUpload(bucket, img));
    },
    [performUpload],
  );

  const ensureCameraPermission = useCallback(async () => {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.status === ImagePicker.PermissionStatus.GRANTED) return true;
    const next = await ImagePicker.requestCameraPermissionsAsync();
    if (next.status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        'Camera access needed',
        'Enable camera access from settings to capture proof photos.',
      );
      return false;
    }
    return true;
  }, []);

  const ensureLibraryPermission = useCallback(async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.status === ImagePicker.PermissionStatus.GRANTED) return true;
    const next = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (next.status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        'Photo library access needed',
        'Enable photo library access from settings to attach proof photos.',
      );
      return false;
    }
    return true;
  }, []);

  const pickFromCamera = useCallback(
    async (bucket) => {
      const ok = await ensureCameraPermission();
      if (!ok) return;
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.92,
          allowsEditing: false,
          exif: false,
        });
        if (result.canceled) return;
        addAssets(bucket, result.assets || []);
      } catch {
        Alert.alert('Camera unavailable', 'Could not open the camera right now.');
      }
    },
    [ensureCameraPermission, addAssets],
  );

  const pickFromLibrary = useCallback(
    async (bucket) => {
      const ok = await ensureLibraryPermission();
      if (!ok) return;
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.92,
          allowsEditing: false,
          allowsMultipleSelection: true,
          selectionLimit: 6,
        });
        if (result.canceled) return;
        addAssets(bucket, result.assets || []);
      } catch {
        Alert.alert('Library unavailable', 'Could not open the photo library right now.');
      }
    },
    [ensureLibraryPermission, addAssets],
  );

  const retry = useCallback(
    (bucket, id) => {
      setBuckets((prev) => {
        const list = prev[bucket];
        const target = list.find((i) => i.id === id);
        if (!target) return prev;
        const nextList = list.map((i) =>
          i.id === id ? { ...i, status: 'uploading', progress: 0, error: null } : i,
        );
        // Kick off the upload after state commits.
        Promise.resolve().then(() => performUpload(bucket, { ...target, progress: 0 }));
        return { ...prev, [bucket]: nextList };
      });
    },
    [performUpload],
  );

  const remove = useCallback((bucket, id) => {
    const controller = controllers.current.get(id);
    if (controller) {
      try {
        controller.abort();
      } catch {
        /* ignore */
      }
      controllers.current.delete(id);
    }
    setBuckets((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((img) => img.id !== id),
    }));
  }, []);

  const reorder = useCallback((bucket, fromIndex, toIndex) => {
    setBuckets((prev) => {
      const list = [...prev[bucket]];
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { ...prev, [bucket]: list };
    });
  }, []);

  const counts = useMemo(
    () => ({
      arrival: buckets.arrival.length,
      before: buckets.before.length,
      after: buckets.after.length,
      arrivalSuccess: buckets.arrival.filter((i) => i.status === 'success').length,
      beforeSuccess: buckets.before.filter((i) => i.status === 'success').length,
      afterSuccess: buckets.after.filter((i) => i.status === 'success').length,
    }),
    [buckets],
  );

  return {
    buckets,
    counts,
    pickFromCamera,
    pickFromLibrary,
    retry,
    remove,
    reorder,
  };
}
