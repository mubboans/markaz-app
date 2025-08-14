export function TryCatchBlocker(fn) {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            console.error("Error in TryCatchBlocker:", error);
            next(error);
        }
    };
}