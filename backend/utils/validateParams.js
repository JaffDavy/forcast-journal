export default function validateParams(id) {
    if (!Number.isInteger(id) || id < 0 || isNaN(id)) {
      throw new Error("id must be a number");
    }
}