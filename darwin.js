import { Configuration, OpenAIApi } from 'openai'
import * as dotenv from 'dotenv'
dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let task = "Write a Sci-Fi short story in the style of Shel Silverstein."
let prompt = task
let generation = null
let settings = {
    "temperature": 0.5,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
}

while (true){
    //EXECUTE TASK
    const taskCompletion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 2000,
        ...settings
    });
    const taskResponse =  taskCompletion.data.choices[0].text
    console.log("Task Response: " + taskResponse);

    //GENERATE IMPROVED PROMPT
    const promptImprovementPrompt = `
    You are an AI improvement agent that optimizes the prompt for an AI task execution agent. 
    Your goal is to alter the current prompt so the task execution agent produces the optimal response.
    The task execution needs to execute this task: 
    ${task}
    The current prompt is ${prompt}
    The task execution agent generated the following response to the current prompt: 
    ${taskResponse}
    Improved prompt:
    `
    const promptImprovementCompletion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: promptImprovementPrompt,
        max_tokens: 1000,
        temperature: 0.5
    });
    prompt = promptImprovementCompletion.data.choices[0].text
    //console.log("Improved Prompt: " + prompt);

    //GENERATE IMPROVED SETTINGS
    const settingsImprovementPrompt = `
    You are an AI improvement agent that optimizes the settings for an AI task execution agent. 
    Your goal is to alter the current settings so the task execution agent produces the optimal response for the promopt. 
    Return the improved settings as valid JSON in the format: {
        "temperature": ,
        "top_p": ,
        "frequency_penalty": ,
        "presence_penalty": ,
    }
    The task execution needs to respond to this prompt: 
    ${prompt}
    Here are its current settings: 
    ${settings}
    `
    const settingsImprovementCompletion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: settingsImprovementPrompt,
        max_tokens: 250,
        temperature: 0.2
    });
    try{
        settings = JSON.parse(settingsImprovementCompletion.data.choices[0].text)
        //console.log("Improved Settings: " + settings);
    }
    catch(error){
        continue
    }
}