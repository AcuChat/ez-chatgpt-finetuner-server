const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const OpenAIApi = require('openai');



exports.initialMessagePair = (prompt, service = "You are a helpful assistant.") => {
    return [
        {
            role: 'system',
            content: service,

        },
        {
            role: 'user',
            content: prompt
        }
    ]
}

exports.openAIGenericChatCompletion = async (apiKey, model, messages, temperature = .7, top_p = null, maxRetries = 10) => {
    //console.log('ai.openAIGenericChatCompletion model', model, JSON.stringify(messages, null, 4))
    const request = {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
        data: {
            model,
            messages
        }
    }

    if (top_p !== null) request.data.top_p = top_p;
    if (temperature !== null) request.data.temperature = temperature;

    //console.log(request); return;

    let success = false;
    let count = 0;
    let seconds = 3;

    while (!success) {
        try {
            result = await axios(request);
            success = true;
        } catch (err) {
            console.error(err);
            console.error("axios err.data", err?.response?.status, err?.response?.statusText);
            ++count;
            if (count >= maxRetries || (err.response.status >= 400 && err.response.status <= 499) ) {
                console.log("STATUS 400 EXIT");
            
                return {
                    status: 'error',
                    number: err.response.status,
                    message: err.response.statusText,
                }
            }
            seconds *= 2;
            console.error(`${model} is busy. Sleeping now.`)
            await sleep(seconds);
            console.error(`Retrying query for ${model}`);
        }
    }

    const response = {
        status: 'success',
        finishReason: result.data.choices[0].finish_reason,
        content: result.data.choices[0].message.content
    }
    return response;
}

exports.getJsonResponse = async (apiKey, model, messages, temperature = .7, top_p = null, maxRetries = 10) => {
    const result = await this.openAIGenericChatCompletion(apiKey, model, messages, temperature, top_p, maxRetries);
    if (result.status === 'error') return false;

    const obj = JSON.parse(result.content);
    return obj;
}

exports.uploadFile = async (fileName, openai) => {
    console.log('uploadFile', fileName);
    try {
        const file = await OpenAIApi.toFile(fs.createReadStream(fileName));
        const response = await openai.files.create(
            {
                file: file,
                purpose: "fine-tune"
            }
        );
        console.log('File ID: ', response?.id)
        return response?.id;
    } catch (err) {
        console.log('err: ', err);
        return false;
    }
}

exports.fineTune = async (fileId, openAiKey, base_model = 'gpt-3.5-turbo-1106', n_epochs = 0, learning_rate_multiplier = 0, batch_size = 0) => {

    const request = {
        url: `https://api.openai.com/v1/fine_tuning/jobs`,
        method: 'post',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`
        },
        data: {
            training_file: fileId,
            model: base_model,
            hyperparameters: {}
        }
    }

    if (n_epochs) request.data.hyperparameters.n_epochs = n_epochs;
    if (learning_rate_multiplier) request.data.hyperparameters.learning_rate_multiplier = learning_rate_multiplier;
    if (batch_size) request.data.hyperparameters.batch_size = batch_size;

    console.log('fine tune request')

    try {
        const response = await axios(request);
        console.log('FineTune response', response.data);
        return response.data;
    } catch(e) {
        console.error(e.response.data);
    }
}

exports.createFineTuneJob = async (systemPrompt, userPrompt, inputArr, desiredOutputArr, openAiKey, baseModel = 'gpt-3.5-turbo-1106', n_epochs = 0, learning_rate_multiplier = 0, batch_size = 0) => {
    const outFile = `/tmp/finetune_${uuidv4()}.jsonl`;
    for (let i = 0; i < inputArr.length; ++i) {
        const entry = {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt + inputArr[i] },
              { role: "assistant", content: desiredOutputArr[i] }
            ]
        }

        fs.appendFileSync(outFile, JSON.stringify(entry) + "\n", "utf-8");
    }

    const openai = new OpenAIApi({
        apiKey: openAiKey
    });
    const fileId = await this.uploadFile(outFile, openai);

    return await this.fineTune(fileId, openAiKey, baseModel, n_epochs, learning_rate_multiplier, batch_size);
}

exports.createUserPromptsArray = (userPrompt, textArray) => textArray.map(text = `'''${userPrompt}\nText:\n${text}'''`);

exports.listFineTuningJobs = async (openAiKey) => {
    const request = {
        url: `https://api.openai.com/v1/fine_tuning/jobs`,
        method: 'get',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`
        },
    }

    try {
        const response = await axios(request);
        console.log(JSON.stringify(response.data, null, 4));
        return response.data;
    } catch (e) {
        console.error(e, e.error);
        return [];
    }
}
