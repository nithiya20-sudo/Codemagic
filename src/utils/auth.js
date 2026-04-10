export const mockLogin = async (username, password) => {
  // simulate a short delay like a real API call
  await new Promise(res => setTimeout(res, 1000));

  if (username === 'admin' && password === '1234') {
    return { success: true, message: 'Login successful' };
  }
  return { success: false, message: 'Invalid credentials' };
};
