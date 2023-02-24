// import Unsplash from 'unsplash-js';
import { createApi } from 'unsplash-js';

const unsplash = new createApi({ accessKey: '_HifaNwNoljS_lFLkUQ7L4nQulMXn6FcCazEVNlhTB8' });
// const unsplash = new Unsplash({ accessKey: '_HifaNwNoljS_lFLkUQ7L4nQulMXn6FcCazEVNlhTB8' });

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
