import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({ error: { message: "OpenAI API key not configured" } });
    return;
  }

  try {
    const prompt = generatePrompt(req.body);
    const prompt_tokens = prompt.split(" ").length + 10;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.0,
      max_tokens: 4096 - prompt_tokens,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(args) {
  return `Bulleted list of 15 popular and diverse categories of shoes, with an example shoe for each one:`;
  // const gender = args.gender;
  // return `List 10 popular shoe models for ${gender}.  For this list, provide a one-line description. ` +
  // `Also list some types of shoes for ${gender}, and list some goals one might have when buying ${gender} shoes.`;
}
