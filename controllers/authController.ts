// controllers/authController.ts
import * as authService from "../services/authService";

export async function registerHandler(
  req: import("next").NextApiRequest,
  res: import("next").NextApiResponse
) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register(name, email, password);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function loginHandler(
  req: import("next").NextApiRequest,
  res: import("next").NextApiResponse
) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.status(200).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
