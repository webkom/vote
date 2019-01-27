const mongoose = require('mongoose')
const debug = require('debug')('colonize')

const initialize = ({
  mongoUrl,
  seedingPath,
  dropDatabase = true,
  connectionWhitelist
}) => {
  if (mongoose.connection && mongoose.connection.host) {
    throw new Error(`There was already a mongoose connection, this is dangerous. Was connected to: ${mongoose.connection.host}`)
  }

  let hasConnected = false

  const connect = async () => {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      promiseLibrary: global.Promise
    })

    hasConnected = true
    debug(`Connected to ${mongoUrl}`)
  }

  const drop = async () => {
    if (!hasConnected) {
      throw new Error('Was trying to drop the database, but was not connected to the test database.')
    }

    if (!connectionWhitelist.includes(mongoose.connection.client.s.url)) {
      throw new Error('Was trying to a non-whitelisted database, cancelled.')
    }

    await mongoose.connection.db.dropDatabase()
    debug(`Dropped the database`)
  }

  const close = async () => {
    debug(`Closing connection to ${mongoUrl}`)

    if (!mongoose.connection) {
      throw new Error('Could not close the connection, there was none.')
    }

    if (!hasConnected) {
      throw new Error(`Wanted to close connection to: ${mongoose.connection.host}, but was not connected to url: ${mongoUrl}`)
    }

    await Promise.all(mongoose.modelNames().map(model => {
      debug(`Ensuring index for model: ${model}`)
      return mongoose.model(model).ensureIndexes()
    }))

    await mongoose.disconnect()

    hasConnected = false

    debug(`Connection closed`)
  }

  const seed = async () => {
    if (!hasConnected) {
      await connect()
    }

    if (dropDatabase) {
      await drop()
    }

    const seeding = require(seedingPath)
    debug(`Loaded seeding directory: '${seedingPath}'`)

    if (!Array.isArray(seeding)) {
      throw new Error('Seeding main file file did not export an array')
    }

    const stash = {}
    const refs = {}

    const getSeedFilePath = seedName => `seeding/${seedName}.js`
    const getSeedingFileError = (seedName, message) => `In seeding file '${getSeedFilePath(seedName)}' a seeding set ${message}`

    const destructSeedObject = (seedName, seedObject) => {
      if (!seedObject.refName) {
        throw new Error(getSeedingFileError(seedName, `was missing required 'refName' property`))
      }

      if (!seedObject.model) {
        throw new Error(getSeedingFileError(seedName, `was missing required 'model' property`))
      }

      if (typeof seedObject.model !== 'function') {
        throw new Error(getSeedingFileError(seedName, `'model' property has to be a function got type: ${typeof seedObject.model}`))
      }

      if (!seedObject.entities) {
        throw new Error(getSeedingFileError(seedName, `was missing required 'entities' property`))
      }

      if (typeof seedObject.model !== 'function') {
        throw new Error(getSeedingFileError(seedName, `'model' was not a function, it should be a function that returns the model`))
      }

      const model = seedObject.model()

      if (!model.create || typeof model.create !== 'function') {
        throw new Error(getSeedingFileError(seedName, `model was invalid (did not have an create function)`))
      }

      if (!seedObject.refName) {
        throw new Error(getSeedingFileError(seedName, `was missing required 'refName' property`))
      }

      if (typeof seedObject.refName !== 'string') {
        throw new Error(getSeedingFileError(seedName, `'refName' property was not a string`))
      }

      return {
        model,
        refName: seedObject.refName,
        entities: seedObject.entities
      }
    }

    const destructEntity = (seedName, entity) => {
      if (!entity.data) {
        throw new Error(getSeedingFileError(seedName, `an entity was missing required 'data' property`))
      }

      if (entity.refName && typeof entity.refName !== 'string') {
        throw new Error(getSeedingFileError(seedName, `an entity's 'refName' property was not a string`))
      }

      return {
        refName: entity.refName || false,
        data: entity.data
      }
    }

    for (const seedCollection of seeding) {
      if (typeof seedCollection !== 'object') {
        throw new Error(`A seed collection in the main file did not export as an object but as ${typeof seedCollection}`)
      }

      debug(`Now seeding: ${Object.keys(seedCollection)}`)

      for (const [seedName, seedStack] of Object.entries(seedCollection)) {
        if (!Array.isArray(seedStack)) {
          throw new Error(`Seeding file '${getSeedFilePath(seedName)}' did not export as an array but as ${typeof seedStack}`)
        }

        for (const seedFunction of seedStack) {
          if (typeof seedFunction !== 'function') {
            throw new Error(`Seeding file '${getSeedFilePath(seedName)}' had a non function seeding set with a ${typeof seedStack}. The array of seeds should all export functions.`)
          }

          const seedObject = seedFunction(refs, stash)

          const {
            refName,
            entities,
            model
          } = destructSeedObject(seedName, seedObject)

          refs[refName] = {}
          stash[refName] = []

          for (const entity of entities) {
            const {
              refName: entityRefName,
              data
            } = destructEntity(seedName, entity)

            const createdEntity = await model.create(data)
            debug(`Created ${model.modelName} with id ${createdEntity._id}`)

            if (entityRefName !== false) {
              refs[refName][entityRefName] = createdEntity
              debug(`Added ref '${refName}.${entityRefName}' with id ${createdEntity._id}`)
            }

            stash[refName].push(createdEntity)
            debug(`Added new entity to stash '${refName}' with id ${createdEntity._id}`)
          }
        }
      }
    }

    debug(`Finished seeding`)

    global.stash = stash
    global.refs = refs

    return {
      stash,
      refs
    }
  }

  return {
    seed,
    close,
    connect
  }
}

module.exports = initialize
