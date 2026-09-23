import app from "./app.js";
import {errorHandler} from "./utils/apiError.js";
const PORT = process.env.PORT || 8000;

app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});