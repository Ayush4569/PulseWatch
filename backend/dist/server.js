import app from "./app.js";
import { config } from "./config/env.js";
import { errorHandler } from "./utils/apiError.js";
const PORT = config.PORT || 5000;
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
