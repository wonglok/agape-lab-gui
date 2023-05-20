let banana = require('@banana-dev/banana-dev')

const apiKey = process.env.BANANNA_API_KEY // "YOUR_API_KEY"
const modelKey = process.env.BANANNA_GPT_KEY // "YOUR_MODEL_KEY"

const modelInputs = {
  prompt: 'How are you?',
}

export default async function AI(req, res) {
  console.log('apiKey, modelKey', apiKey, modelKey)
  let run = async () => {
    let prompt = req.query.prompt

    if (prompt) {
      modelInputs.prompt = prompt
    }
    let out = await banana.run(apiKey, modelKey, modelInputs)
    console.log(out)

    res.json(out)
  }
  await run()
}
