exports.create = async (req, res) => {
    const { name, systemPrompt, userPrompt, model } = req.body;
    const files = req.file;
  
    // Process the received data
    console.log('Name:', name);
    console.log('SystemPrompt:', systemPrompt);
    console.log('UserPrompt:', userPrompt);
    console.log('Files:', files);
  
    // Respond with success message
    res.send('Files uploaded successfully.');
}