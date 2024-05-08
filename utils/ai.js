const axios = require('axios');

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