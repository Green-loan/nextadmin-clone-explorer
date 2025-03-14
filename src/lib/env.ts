
// No API keys needed when using Hugging Face models in the browser
export const env = {
  // This is kept for backward compatibility but is no longer needed
  OPENAI_API_KEY: ''
};

// Always returns true since we're using local models now
export const isOpenAIConfigured = () => {
  return true;
};
