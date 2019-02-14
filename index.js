var spawn = require('child_process').spawn
var stream = require('stream')
var util = require('util')
var concat = require('concat-stream')

function Mdb(file) {
  stream.Stream.call(this)
  this.writable = true
  this.file = file
  this.tableDelimiter = ','
}

util.inherits(Mdb, stream.Stream)

Mdb.prototype.toCSV = function(table, cb) {
  var cmd = spawn('mdb-export', [this.file, table])
  cmd.stdout.pipe(
    concat(function(err, out) {
      if (err) return cb(err)
      if (!out) return cb('no output')
      cb(false, out.toString())
    })
  )
}

Mdb.prototype.toSQL = function(table, cb) {
  var cmd = spawn('mdb-export', ['-I', 'sqlite', this.file, table])
  cmd.stdout.pipe(
    concat(function(err, out) {
      if (err) return cb(err)
      if (!out) return cb('no output')
      cb(false, out.toString())
    })
  )
}

Mdb.prototype.tables = function(cb) {
  var self = this
  var cmd = spawn('mdb-tables', ['-d' + this.tableDelimiter, this.file])
  cmd.stdout.pipe(
    concat(function(err, out) {
      if (err) return cb(err.toString())
      if (!out) return cb('no output')
      var tables = out.toString().replace(/,\n$/, '').split(self.tableDelimiter)
      cb(false, tables)
    })
  )
}

Mdb.prototype.schema = function(cb) {
  var self = this
  var cmd = spawn('mdb-schema', [this.file, 'sqlite'])
  cmd.stdout.pipe(
    concat(function(err, out) {
      if (err) return cb(err.toString())
      if (!out) return cb('no output')
      cb(false, out.toString())
    })
  )
}

module.exports = function(data) {
  return new Mdb(data)
}

module.exports.Mdb = Mdb
