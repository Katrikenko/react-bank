const generateService = require('./generateService')

class Users {
  static #list = []
  static #count = 1

  constructor({ email, password }) {
    this.id = Users.#count++
    this.email = String(email).toLowerCase()
    this.password = String(password)
    this.token = generateService.generateToken(6)
    this.confirmCode = generateService.generateConfirmCode()
    this.confirm = false
    this.balance = 0.0
    this.notifications = []
    this.transactions = []

    this.users = [
      {
        confirm: true,
        email: 'test@mail.com',
        password: 'Test1234',
        token: 'FxZBgU',
      },
      {
        confirm: false,
        email: 'user@mail.com',
        password: 'Password1',
        token: '1zxQV8',
      },
    ]
  }

  static create(data) {
    const user = new Users(data)
    this.#list.push(user)
    return user
  }

  static getUserByEmail(email) {
    return (
      this.users.find(
        (user) =>
          user.email === String(email).toLowerCase(),
      ) || null
    )
  }

  static getById(id) {
    return (
      this.#list.find((user) => user.id === Number(id)) ||
      null
    )
  }

  static getList = () => this.#list
}

module.exports = Users
