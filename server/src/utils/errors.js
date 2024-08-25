class Errors {
    static okResult(data) {
      return { isOk: true, val:data };
    }
  
    static errResult(message, code) {
      return { isOk: false, error: { message, code } };
    }
  
    static get VOID_RESULT() {
      return { isOk: true };
    }
  }
  
module.exports = { Errors };
  