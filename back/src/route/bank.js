const express = require('express')
const router = express.Router()
const cors = require('cors')

const generateService = require('../class/generateService')

router.use(cors())

const users = [
  //   {
  //     confirm: true,
  //     email: 'test@mail.com',
  //     password: 'Test1234',
  //     token: 'FxZBgU',
  //     balance: 100.1,
  //     transactions: [
  //       {
  //         amount: '10.00',
  //         paymentMethod: 'Stripe',
  //         paymentTime: '14:30',
  //         paymentDate: '2023-11-30',
  //         type: 'Receipt',
  //         transactionId: 1,
  //       },
  //     ],
  //   },
  //   {
  //     confirm: false,
  //     email: 'user@mail.com',
  //     password: 'Password1',
  //     token: '1zxQV8',
  //     balance: 456.5,
  //     transactions: [],
  //   },
]

const notificationsList = {
  notifications: [],
}
const transactions = {}

router.get('/users', function (req, res) {
  const usersData = users.map((user) => ({
    confirm: user.confirm,
    email: user.email,
    token: user.token,
  }))
  res.json(usersData)
})

router.post('/auth', function (req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized' })
    }

    const user = users.find((user) => user.token === token)

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Invalid token' })
    }

    console.log('confirmCode:', user.confirmCode)

    return res.status(200).json({
      confirm: user.confirm,
      balance: user.balance,
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})
router.post('/signup', function (req, res) {
  try {
    const { email, password } = req.body

    console.log('Current users:', users)

    const userExists = users.some(
      (user) => user.email === email,
    )

    if (userExists) {
      return res.status(400).json({
        message: 'User with the same email already exists',
      })
    }

    const token = generateService.generateToken(6)
    const confirmCode =
      generateService.generateConfirmCode()

    const user = {
      email,
      password,
      token,
      confirmCode,
      confirm: false,
    }

    users.push(user)

    return res.status(200).json({
      message: 'User registered successfully',
      token: user.token,
      user: {
        email: user.email,
        confirm: user.confirm,
        confirmCode: user.confirmCode,
      },
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/signup-confirm', function (req, res) {
  try {
    const { email, confirmCode } = req.body
    console.log('req.body signup-confirm:', req.body)

    const user = users.find((user) => user.email === email)

    if (user && user.confirmCode === confirmCode) {
      user.confirm = true

      return res.status(200).json({
        message: 'Account verification successful',
        user: {
          email: user.email,
          confirm: user.confirm,
        },
      })
    } else {
      return res.status(400).json({
        message: 'The code is invalid. Please try again.',
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/signin', function (req, res) {
  try {
    const { email, password } = req.body

    const foundUser = users.find((user) => {
      return (
        user.email === email && user.password === password
      )
    })

    if (foundUser) {
      const token = foundUser.token

      return res.status(200).json({
        message: 'Login successful',
        token: token,
        confirm: foundUser.confirm,
        email: foundUser.email,
        password: foundUser.password,
      })
    } else {
      return res.status(400).json({
        message: 'Incorrect email or password',
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recovery', function (req, res) {
  try {
    const { email } = req.body
    const user = users.find((user) => user.email === email)

    if (user) {
      const recoveryCode = generateService.generateCode()
      user.recoveryCode = recoveryCode
      console.log(
        `Recovery code for ${email}: ${recoveryCode}`,
      )
      res.status(200).json({
        message: 'Recovery code sent successfully',
        recoveryCode,
      })
    } else {
      return res
        .status(404)
        .json({ message: 'User not found' })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})
router.post('/recovery-confirm', function (req, res) {
  try {
    const { email, recoveryCode, newPassword, token } =
      req.body

    const user = users.find((user) => user.email === email)

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found' })
    }

    if (user) {
      if (
        Number(user.recoveryCode) === Number(recoveryCode)
      ) {
        user.password = newPassword

        res.status(200).json({
          message: 'Password updated successfully',
          user: {
            email: user.email,
          },
        })
      } else {
        return res.status(400).json({
          message: 'Invalid recovery code',
        })
      }
    } else {
      return res.status(400).json({
        message: 'Invalid recovery email',
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.get('/balance/:token', function (req, res) {
  try {
    const { token } = req.params
    const user = users.find((user) => user.token === token)

    if (user) {
      res.status(200).json({
        balance: user.balance,
        transactions: user.transactions || [],
        transactionData:
          user.transactions[user.transactions.length - 1] ||
          null,
        receiptData:
          user.transactions[user.transactions.length - 1] ||
          null,
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/send', function (req, res) {
  try {
    const { token, recipientEmail, amount } = req.body

    const sender = users.find(
      (user) => user.token === token,
    )

    if (sender) {
      const senderBalance = parseFloat(sender.balance)
      const sendingAmount = parseFloat(amount)

      if (
        !isNaN(sendingAmount) &&
        senderBalance >= sendingAmount
      ) {
        sender.balance = (senderBalance - sendingAmount)
          .toFixed(2)
          .toString()

        const transactionData = {
          amount: sendingAmount.toFixed(2).toString(),
          paymentMethod: recipientEmail,
          paymentTime: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          paymentDate: new Date().toLocaleDateString(),
          type: 'Sending',
        }

        sender.transactions.push(transactionData)

        res.status(200).json({
          sender: {
            email: sender.email,
            balance: sender.balance,
            transactions: sender.transactions,
          },
        })
      } else {
        res.status(400).json({
          error: 'Invalid amount',
        })
      }
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/receive', function (req, res) {
  try {
    const { token, amount, paymentMethod } = req.body

    const recipient = users.find(
      (user) => user.token === token,
    )

    if (recipient) {
      if (!recipient.hasOwnProperty('balance')) {
        recipient.balance = 0
      }

      const receivedAmount = parseFloat(amount)

      if (!isNaN(receivedAmount)) {
        recipient.balance = (
          parseFloat(recipient.balance) + receivedAmount
        )
          .toFixed(2)
          .toString()

        const receiptData = {
          amount: receivedAmount.toFixed(2).toString(),
          paymentMethod,
          paymentTime: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          paymentDate: new Date().toLocaleDateString(),
          type: 'Receipt',
        }

        if (!recipient.hasOwnProperty('transactions')) {
          recipient.transactions = []
        }

        recipient.transactions.push(receiptData)

        res.status(200).json({
          recipient: {
            balance: recipient.balance,
            transactions: recipient.transactions,
          },
        })
      } else {
        res.status(404).json({ message: 'Invalid amount' })
      }
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.get(
  '/transaction/:transactionId',
  function (req, res) {
    try {
      const { transactionId } = req.params

      if (!transactionId) {
        return res.status(400).json({
          error: 'TransactionId is missing',
        })
      }

      const index = parseInt(transactionId, 10)
      if (isNaN(index)) {
        return res
          .status(400)
          .json({ error: 'Invalid transaction ID' })
      }

      const userId =
        req.headers.authorization?.split(' ')[1]
      const user = users.find(
        (user) => user.token === userId,
      )

      if (!user) {
        return res
          .status(404)
          .json({ message: 'User not found' })
      }

      if (!isNaN(index) && user.transactions) {
        const transaction =
          user.transactions[
            user.transactions.length - 1 - index
          ]

        if (transaction) {
          const {
            amount,
            paymentMethod,
            paymentTime,
            paymentDate,
            type,
          } = transaction

          const transactionData = {
            amount,
            paymentMethod,
            paymentTime,
            paymentDate,
            type,
          }

          const receiptData = transactionData

          res
            .status(200)
            .json({ transactionData, receiptData })
        } else {
          res
            .status(404)
            .json({ message: 'Transaction not found' })
        }
      } else {
        res.status(404).json({
          message:
            'Transactions not available for the user',
        })
      }
    } catch (err) {
      res.status(400).json({
        message: err.message,
      })
    }
  },
)

router.post('/settings', function (req, res) {
  try {
    const { token, email, oldPassword, newPassword } =
      req.body

    const user = users.find((user) => user.token === token)

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found' })
    }

    if (newPassword !== undefined) {
      if (user.password !== oldPassword) {
        return res.status(400).json({
          message: 'Incorrect old password',
        })
      }
      user.password = newPassword

      res.status(200).json({
        message: 'Password updated successfully',
      })
    }

    if (email !== undefined) {
      user.email = email
      res.status(200).json({
        message: 'Email updated successfully',
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/notifications', function (req, res) {
  try {
    const { token } = req.body

    const userNotifications =
      notificationsList.notifications.filter(
        (notification) => notification.userId === token,
      )

    if (!token) {
      return res.status(400).json({
        error: 'Token is missing',
      })
    }

    res.status(200).json({
      userNotifications,
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/getNotifications', function (req, res) {
  try {
    const { token, type, message } = req.body

    const newNotification = {
      id: notificationsList.notifications.length + 1,
      type,
      message,
      time: new Date().toString(),
      userId: token,
    }

    notificationsList.notifications.push(newNotification)

    res.status(200).json({
      notificationsList,
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

module.exports = router
