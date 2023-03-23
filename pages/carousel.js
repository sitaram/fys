import { useState, useEffect } from 'react';
import Image from 'next/image'
import axios from 'axios';
import { Grid, Card, CardMedia, CardContent, Typography } from '@material-ui/core';
import { PhotoLibrary } from '@material-ui/icons';
import styles from '@/styles/Home.module.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination } from 'swiper';

// example usage:
// export default function Home() {
//   return (<Carousel queries={["dog", "cat", "bird", "boa", "elephant", "hippo"]} />);
// }

const UNSPLASH_API_KEY = '_HifaNwNoljS_lFLkUQ7L4nQulMXn6FcCazEVNlhTB8';

SwiperCore.use([Navigation, Pagination]);

const Carousel = ({ queries, labels }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const promises = queries.map(async (query) => {
        const response = await axios.get(`https://api.unsplash.com/search/photos?query=${query}&per_page=3`, {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
          },
        });
        return response.data.results;
      });

      const imagesByQuery = await Promise.all(promises);
      setImages(imagesByQuery);
    };

    fetchData();
  }, [queries]);

  return (
      <Swiper
	slidesPerGroup={1}
        navigation
	grabCursor={true}
        pagination={{ clickable: true }}
	breakpoints={{
	  768: { // desktop
	    slidesPerView: 5,
	    spaceBetween: 30,
	  },
	  0: {  // mobile
	    slidesPerView: 1.3,
	    spaceBetween: 20,
	  },
	}}
      >
        {images.map((imageList, index) => (
          <SwiperSlide key={imageList[0].id}>
	    {imageList.map((image) => (
	      <Image
		key={image.id}
		src={image.urls.regular}
		alt={image.alt_description || ""}
		width={image.width}
		height={image.height}
	      />
	    ))}
	    <div className="label"><div className="innerlabel">
	      {(labels && labels[index]) || queries[index]}
	    </div></div>
          </SwiperSlide>
        ))}
      </Swiper>
  );
};

export default Carousel;
