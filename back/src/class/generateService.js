class GenerateService {
  generateToken() {
    const length = 6
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(
        Math.random() * characters.length,
      )
      result += characters[randomIndex]
    }

    return result
  }

  generateConfirmCode() {
    return Math.floor(Math.random() * 900000) + 100000
  }

  generateCode = () => {
    return Math.floor(Math.random() * 9000) + 1000
  }
}

module.exports = new GenerateService()
