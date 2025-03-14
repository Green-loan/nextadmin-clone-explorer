
// Default to empty strings for development
export const env = {
  OPENAI_API_KEY: ''
};

// Helper function to check if OpenAI API key is configured
export const isOpenAIConfigured = () => {
  return !!env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-placeholder' && env.OPENAI_API_KEY.length > 20;
};
