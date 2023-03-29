import Carousel from "./carousel";
import Head from 'next/head'
import Image from 'next/image'
// import styles from '@/styles/Home.module.css'
import { getPhotos } from '../lib/unsplash';
import { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// function Homes() {
  // return (<Carousel queries={["hiking", "sailing", "museum", "glass blowing", "biking", "playing board games"]} />);
  // return (<Carousel queries={["hiking shoes", "sandals", "ballet flats", "sneakers", "oxfords", "clogs"]} />);
  // return (<Carousel queries={["dog", "cat", "bird", "boa", "elephant", "hippo"]} />);
  // return ( <Carousel queries={["Nike Air Max", "Adidas Ultra Boost", "Reebok CrossFit Nano"]} />);
  // return ( <Carousel queries={["Nike Air Max", "Adidas Ultra Boost", "Reebok CrossFit Nano"], ["Running", "Walking", "Jogging"]} />);
// }


async function getActivity() {
  const activities = await generate({ q: 'activity' });
  return activities;
}

function vsplit(strings) {
  const [firstParts, secondParts] = strings.reduce(
    ([firstParts, secondParts], string) => {
      const [firstPart, secondPart] = string.split(' - ');
      if (secondPart)
	return [[...firstParts, firstPart], [...secondParts, secondPart]];
      else
	return [[...firstParts, string], [...secondParts, string]];
    },
    [[], []]
  );
  return [firstParts, secondParts];
}

function Activity() {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    setLoading(true);
    getActivity().then(activities => {
      setActivities(activities);
      setLoading(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  if (loading) {
    return <button style={{ display:loading?"block":"none" }} disabled type="button" className="py-2 px-5 my-2 text-sm border font-medium text-gray-900 bg-white rounded-lg border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
	  <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
	  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
	  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
	  </svg>
	  Loading...
	</button>;
  }

  const v = vsplit(activities);
    // framed: <div className="p-4 my-2 bg-white rounded-lg space-x-4 shadow-md">
    // vs.
    // frameless: <div className="p-4 my-2 space-x-4">
  return (
    <div className="p-4 my-2 bg-white rounded-lg space-x-4 shadow-md">
    <div>Here are some initial ideas:</div>
    <Carousel queries={v[0], v[0]} />
    <div className="pt-6">Choose one to explore further, or provide some guidance in this box:
    <input className="appearance-none ml-4 bg-gray-100 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white"
     size="60" id="input" type="text" placeholder="E.g., want to learn something new, with kids, near palo alto" />
    </div>

    </div>
  );
}

    // <ul> {activities.map((item, index) => (<li key={item}>{item}</li>))} </ul>

async function generate(args) {
  const capitalize = (s) => { return s[0].toUpperCase() + s.slice(1); };
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    const data = await response.json();
    if (response.status !== 200) {
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }
    console.log(data.result);
    return data.result.split(/[\n,]/).
      filter(x => x).
      map(x => capitalize(x.replace(/^ *(\d+\.)? */,'').replace(/\.$/,'')));
  } catch(error) {
    console.error(error);
    alert(error.message);
    return [];
  }
}


export default function Home() {
  const [content, setContent] = useState([]);
  const show = (x) => { setContent(content => [...content, x]); };

  async function activity() {
    show(<Activity />);
  }

  return (
    <>
      <Head>
        <title>Find yourself</title>
        <meta name="description" content="Find yourself" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
	<div className="p-4 my-2 max-w-sm bg-white rounded-lg flex items-center space-x-4 shadow-md hover:shadow-xl active:shadow-none" onClick={activity}>
	  <img className="h-24 w-30" src="/weekend3.jpg" alt="Weekend" />
	  <div>
	    <div className="text-l text-slate-500">What do you want to do..</div>
	    <p className="text-xl text-black">this weekend?</p>
	  </div>
	</div>

	{content}
      </main>
    </>
  )
}
