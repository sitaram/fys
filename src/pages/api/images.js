import axios from 'axios';

const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

export default async (req, res) => {
  const query = req.query.q;
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=3&client_id=${UNSPLASH_API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching images from Unsplash API' });
  }
};

