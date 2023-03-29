// import Unsplash from 'unsplash-js';
import { createApi } from 'unsplash-js';

const unsplash = new createApi({ accessKey: 'XXX' });
// const unsplash = new Unsplash({ accessKey: 'XXX' });

export async function getPhotos(q) {
  try {
    const response = await unsplash.search.getPhotos({ query: q, per_page: 10 });
    console.log(response.response.resuls);
    const photos = await response.response.results;
    console.log(photos);
    return photos;
  } catch (error) {
    console.error(error);
  }
}
