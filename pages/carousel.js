import { useState, useEffect } from 'react';
import axios from 'axios';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { Grid, Card, CardMedia, CardContent, Typography } from '@material-ui/core';
import { PhotoLibrary } from '@material-ui/icons';

const API_KEY = '_HifaNwNoljS_lFLkUQ7L4nQulMXn6FcCazEVNlhTB8';

const Carousel = ({ queries }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const promises = queries.map(async (query) => {
        const response = await axios.get(`https://api.unsplash.com/search/photos?query=${query}&per_page=3`, {
          headers: {
            Authorization: `Client-ID ${API_KEY}`,
          },
        });
        return response.data.results;
      });

      const imagesByQuery = await Promise.all(promises);

      const allImages = imagesByQuery.reduce((acc, images) => [...acc, ...images], []);
      setImages(allImages);
    };

    fetchData();
  }, [queries]);

  return (
    <AliceCarousel>
      {images.map((image) => (
        <Grid key={image.id} container justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={image.urls.small}
                alt={image.alt_description}
              />
              <CardContent sx={{ position: 'absolute', bottom: 0, background: 'rgba(0, 0, 0, 0.5)' }}>
                <Typography variant="h6" color="textPrimary">
                  {image.alt_description || image.description || 'Untitled'}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  by {image.user.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ position: 'relative', marginLeft: '-50px' }}>
              <CardMedia
                component="img"
                height="200"
                image={image.urls.small}
                alt={image.alt_description}
              />
              <CardContent sx={{ position: 'absolute', bottom: 0, background: 'rgba(0, 0, 0, 0.5)' }}>
                <Typography variant="h6" color="textPrimary">
                  {image.alt_description || image.description || 'Untitled'}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  by {image.user.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ position: 'relative', marginLeft: '-100px' }}>
              <CardMedia
                component="img"
                height="200"
                image={image.urls.small}
                alt={image.alt_description}
              />
              <CardContent sx={{ position: 'absolute', bottom: 0, background: 'rgba(0, 0, 0, 0.5)' }}>
                <Typography variant="h6" color="textPrimary">
              {image.alt_description || image.description || 'Untitled'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              by {image.user.name}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ))}
</AliceCarousel>
);
};

export default Carousel;
