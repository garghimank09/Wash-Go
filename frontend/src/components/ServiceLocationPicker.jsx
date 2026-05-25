import { APIProvider } from '@vis.gl/react-google-maps';

import { GOOGLE_MAPS_API_KEY, isGoogleMapsConfigured } from '../constants/maps';
import { GoogleServiceLocationPicker } from './maps/GoogleServiceLocationPicker';
import { ServiceLocationPickerLeaflet } from './maps/ServiceLocationPickerLeaflet';

/** Service location map — Google Maps when API key is set, otherwise Leaflet/OSM. */
export function ServiceLocationPicker(props) {
  if (isGoogleMapsConfigured()) {
    return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'marker']} version="weekly">
        <GoogleServiceLocationPicker {...props} />
      </APIProvider>
    );
  }
  return <ServiceLocationPickerLeaflet {...props} />;
}
