const fs = require('fs')
const Discord = require('discord.js')
const { prefix, token, categories } = require('config')

// Set up contest tracker
const contests = require('./contests')
contests.init()

// Set up bot
const client = new Discord.Client()
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands')

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)

  if (command.category && !categories.includes(command.category)) continue

  client.commands.set(command.name, command)
  console.log('Command Registered: ', command.name)
}

client.on('ready', () => {
  console.log('Ready!')
})

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  const args = message.content.slice(prefix.length).split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!')
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  try {
    command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('there was an error trying to execute that command!')
  }
})

client.login(token)
