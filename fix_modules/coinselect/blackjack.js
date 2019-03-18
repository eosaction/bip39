var utils = require('./utils')
let BigNumber = require('bignumber.js');

// only add inputs if they don't bust the target value (aka, exact match)
// worst-case: O(n)
function blackjack(utxos, outputs, feeRate) {
  if (!isFinite(utils.uintOrNaN(feeRate))) return {}

  var bytesAccum = utils.transactionBytes([], outputs)

  var inAccum = 0
  var inputs = []
  var outAccum = utils.sumOrNaN(outputs)
  var threshold = utils.dustThreshold({}, feeRate)

  for (var i = 0; i < utxos.length; ++i) {
    var input = utxos[i]
    var inputBytes = utils.inputBytes(input)
    var fee = feeRate * (bytesAccum + inputBytes)
    var inputValue = utils.uintOrNaN(input.value)

    // would it waste value?
    if ((inAccum + inputValue) > (outAccum + fee + threshold)) continue

    bytesAccum += inputBytes
    inAccum += inputValue
    inputs.push(input)

    // go again?
    if (inAccum < outAccum + fee) continue

    return utils.finalize(inputs, outputs, feeRate)
  }

  return {
    fee: feeRate * bytesAccum
  }
}

// for vhkd coin
// only add inputs if they don't bust the target value (aka, exact match)
// worst-case: O(n)
function percentFeeBlackjack(utxos, outputs, feeRate, minFee, maxFee) {
  var inAccum = 0
  var inputs = []
  var outAccum = utils.sumOrNaN(outputs)
  let fee = utils.calfee(outAccum, feeRate, minFee, maxFee)
  //let fee = new BigNumber(outAccum).times(feeRate).integerValue(0).toNumber();

  for (var i = 0; i < utxos.length; ++i) {
    var input = utxos[i]
    var inputValue = utils.uintOrNaN(input.value)

    // would it waste value?
    if ((inAccum + inputValue) > (outAccum + fee)) continue

    inAccum += inputValue
    inputs.push(input)

    // go again?
    if (inAccum < outAccum + fee) continue

    return utils.feefinalize(inputs, outputs, fee)
  }

  return {
    fee: fee
  }
}

module.exports = {
  blackjack: blackjack,
  percentFeeBlackjack: percentFeeBlackjack
}