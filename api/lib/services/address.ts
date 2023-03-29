import axios from 'axios';

const {
  GEOCODE_GOOGLE_API = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?components=country:us',
  GEOCODE_GOOGLE_APIKEY,
} = process.env;

export class AddressService {
  async getGoogleAddress({ address }: any) {
    const geoCodeResponse = await axios.get(GEOCODE_GOOGLE_API, {
      params: {
        input: address,
        key: GEOCODE_GOOGLE_APIKEY,
      },
    });

    const locations = geoCodeResponse.data.predictions.map((result: any) => ({
      ...result,
      name: result.description,
    }));

    return locations;
  }
}
