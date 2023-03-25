import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async (req, res) => {
  const url = 'https://api.openai.com/v1/completions';
  const prompt = req.query.prompt || "";
  console.log('prompt: "' + prompt + '"');

  if (!prompt) {
    console.error('Missing OpenAI prompt', req);
    res.status(500).json({ message: 'Error missing OpenAI prompt' });
    return;
  }

  const data = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.0,
    'max_tokens': 4000 - prompt.split(" ").length + 10,
  };

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    }
  };

  try {
    const response = await axios.post(url, data, config);
    const responseData = response.data;
    res.status(200).json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data from OpenAI API' });
  }
};



// import { Configuration, OpenAIApi } from "openai";
// 
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
// 
// export default async function (req, res) {
//   if (!configuration.apiKey) {
//     res.status(500).json({ error: { message: "OpenAI API key not configured" } });
//     return;
//   }
// 
//   try {
//     const prompt = generatePrompt(req.body);
//     const prompt_tokens = prompt.split(" ").length + 10;
// 
//     const completion = await openai.createCompletion({
//       model: "text-davinci-003",
//       // model: "text-ada-001",
//       prompt: prompt,
//       temperature: 0.0,
//       max_tokens: 4000 - prompt_tokens,
//       // max_tokens: 4096 - prompt_tokens,
//       // max_tokens: 600 - prompt_tokens,
//     });
//     res.status(200).json({ result: completion.data.choices[0].text });
//   } catch(error) {
//     // Consider adjusting the error handling logic for your use case
//     if (error.response) {
//       console.error(error.response.status, error.response.data);
//       res.status(error.response.status).json(error.response.data);
//     } else {
//       console.error(`Error with OpenAI API request: ${error.message}`);
//       res.status(500).json({
//         error: {
//           message: 'An error occurred during your request.',
//         }
//       });
//     }
//   }
// }
// 
// function generatePrompt(args) {
//   // content prompt:
//   return `Bulleted list of 15 popular and diverse activities that people do over the weekend. Take into consideration the user's preferences: artsy, social, fun, relaxing:`;
//   // return `Bulleted list of 15 popular and diverse activities that people do over the weekend. Take into consideration the user's preferences: want to learn something, with kids, near palo alto:`;
// 
//   // context prompt:
//   // return `Bulleted list of 15 specific factors like "with kids", "near palo alto", "want to learn something", etc., that one might consider while choosing an activity for the weekend:`;
// 
//   // inspect prompt:
//   // return `Expand on the theme "Go to a local winery for a wine tasting" factoring in the user's aforementioned preferences: want to learn something, with kids, near palo alto. Produce a medium length paragraph with multiple specific options, with bullet points.`;
//   // return `Expand on the theme "Go to a spa" factoring in the user's aforementioned preferences: artsy, social, fun, relaxing, near palo alto. Produce a medium length paragraph with multiple specific concrete options, in bullet points, broken out into "title - description" format.`;
// 
//   // action prompt:
//   // return `Expand on relevant actions with actionable links wrt "Palo Alto Nail & Spa" for the "Go to a spa" choice:`;
// 
//   // const gender = args.gender;
//   // return `List 10 popular shoe models for ${gender}.  For this list, provide a one-line description. ` +
//   // `Also list some types of shoes for ${gender}, and list some goals one might have when buying ${gender} shoes.`;
//   // return `Numbered list of 15 popular and diverse categories of shoes, with an example shoe for each one:`;
//   // return `Bulleted list of 15 popular and diverse activities that people do over the weekend, with one-line descriptions of why people want to do them`;
// }
