/* Copyright (c) 2016 Richard Rodger, MIT License */
'use strict'

var Lab = require('lab')
var Code = require('code')
var Seneca = require('..')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var expect = Code.expect

var test_opts = {log: 'test'}

describe('sequence', function () {
  it('ready-always-called', function (fin) {
    Seneca(test_opts)
      .error(fin)
      .ready(function () {
        this.ready(fin)
      })
  })

  it('single-add-act', function (fin) {
    Seneca(test_opts)
      .error(fin)
      .add('a:1', function (msg, done) {
        msg.x = 2
        done(null, msg)
      })
      .act('a:1', function (err, out) {
        expect(out.a).to.equal(1)
        expect(out.x).to.equal(2)
        fin(err)
      })
  })

  it('double-add-act', function (fin) {
    var log = []
    Seneca(test_opts)
      .error(fin)
      .add('a:1', function (msg, done) {
        log.push('a:1-call')
        msg.x = 2
        done(null, msg)
      })
      .act('a:1', function (ignore, out) {
        log.push('a:1-check')
        expect(out.a).to.equal(1)
        expect(out.x).to.equal(2)
      })
      .add('a:2', function (msg, done) {
        log.push('a:2-call')
        msg.y = 3
        done(null, msg)
      })
      .act('a:2', function (err, out) {
        expect(out.a).to.equal(2)
        expect(out.y).to.equal(3)
        expect(log).to.deep.equal(
          [ 'a:1-call', 'a:1-check', 'a:2-call' ]
        )
        fin(err)
      })
  })

  it('single-add-act-ready', function (fin) {
    var log = []
    Seneca(test_opts)
      .error(fin)

    // this works! acts only happen after all gates finished
      .act('a:1', function (ignore, out) {
        log.push('a:1-act')
        expect(out.a).to.equal(1)
        expect(out.x).to.equal(2)
      })

      .add('a:1', function (msg, done) {
        log.push('a:1-add')
        msg.x = 2
        done(null, msg)
      })

      .ready(function () {
        log.push('ready-0')
      })
      .ready(function () {
        log.push('ready-1')
      })
      .ready(function () {
        log.push('ready-2')
      })
      .ready(function () {
        expect(log).to.deep.equal(
          [ 'a:1-add', 'a:1-act', 'ready-0', 'ready-1', 'ready-2' ]
        )
        fin()
      })
  })

  it('single-add-act-gate-action', function (fin) {
    Seneca(test_opts)
      .error(fin)
      .add('a:1', function (msg, done) {
        msg.x = 2
        done(null, msg)
      })
      .act('a:1,gate$:true', function (ignore, out) {
        expect(out.a).to.equal(1)
        expect(out.x).to.equal(2)
        fin()
      })
  })

  it('single-add-act-gate-instance', function (fin) {
    Seneca(test_opts)
      .error(fin)
      .add('a:1', function (msg, done) {
        msg.x = 2
        done(null, msg)
      })
      .gate()
      .act('a:1', function (ignore, out) {
        expect(out.a).to.equal(1)
        expect(out.x).to.equal(2)
        fin()
      })
  })
})
