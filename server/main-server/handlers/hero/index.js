/**
 * ============================================================================
 * Hero Handler — Main Server (Router)
 * ============================================================================
 * Actions: activeHeroBreak, activeSkill, activeSkin, autoHeroBreak, autoLevelUp, autoMerge, autoTakeOff, cancelQigong, changeHeadImage, evolve, getActivityDetail, getAttrs, getInfo, getRecord, getTimeTrialHeroPower, getTreasureInfo, heroBreak, inherit, plus, qigong, queryArenaHeroEquipInfo, queryHeroEquipInfo, randSummons, readWishList, reborn, rebornSelfBreak, resolve, saveFastTeam, saveQigong, sendMsg, splitHero, takeOffAuto, useSkin, wakeUp
 */

var ResponseHelper = require('../../core/responseHelper');
var logger         = require('../../utils/logger');

// ============================================
// ACTION HANDLERS
// ============================================

var activeHeroBreak = require('./activeHeroBreak');
var activeSkill = require('./activeSkill');
var activeSkin = require('./activeSkin');
var autoHeroBreak = require('./autoHeroBreak');
var autoLevelUp = require('./autoLevelUp');
var autoMerge = require('./autoMerge');
var autoTakeOff = require('./autoTakeOff');
var cancelQigong = require('./cancelQigong');
var changeHeadImage = require('./changeHeadImage');
var evolve = require('./evolve');
var getActivityDetail = require('./getActivityDetail');
var getAttrs = require('./getAttrs');
var getInfo = require('./getInfo');
var getRecord = require('./getRecord');
var getTimeTrialHeroPower = require('./getTimeTrialHeroPower');
var getTreasureInfo = require('./getTreasureInfo');
var heroBreak = require('./heroBreak');
var inherit = require('./inherit');
var plus = require('./plus');
var qigong = require('./qigong');
var queryArenaHeroEquipInfo = require('./queryArenaHeroEquipInfo');
var queryHeroEquipInfo = require('./queryHeroEquipInfo');
var randSummons = require('./randSummons');
var readWishList = require('./readWishList');
var reborn = require('./reborn');
var rebornSelfBreak = require('./rebornSelfBreak');
var resolve = require('./resolve');
var saveFastTeam = require('./saveFastTeam');
var saveQigong = require('./saveQigong');
var sendMsg = require('./sendMsg');
var splitHero = require('./splitHero');
var takeOffAuto = require('./takeOffAuto');
var useSkin = require('./useSkin');
var wakeUp = require('./wakeUp');

var actions = {
  activeHeroBreak: activeHeroBreak,
  activeSkill: activeSkill,
  activeSkin: activeSkin,
  autoHeroBreak: autoHeroBreak,
  autoLevelUp: autoLevelUp,
  autoMerge: autoMerge,
  autoTakeOff: autoTakeOff,
  cancelQigong: cancelQigong,
  changeHeadImage: changeHeadImage,
  evolve: evolve,
  getActivityDetail: getActivityDetail,
  getAttrs: getAttrs,
  getInfo: getInfo,
  getRecord: getRecord,
  getTimeTrialHeroPower: getTimeTrialHeroPower,
  getTreasureInfo: getTreasureInfo,
  heroBreak: heroBreak,
  inherit: inherit,
  plus: plus,
  qigong: qigong,
  queryArenaHeroEquipInfo: queryArenaHeroEquipInfo,
  queryHeroEquipInfo: queryHeroEquipInfo,
  randSummons: randSummons,
  readWishList: readWishList,
  reborn: reborn,
  rebornSelfBreak: rebornSelfBreak,
  resolve: resolve,
  saveFastTeam: saveFastTeam,
  saveQigong: saveQigong,
  sendMsg: sendMsg,
  splitHero: splitHero,
  takeOffAuto: takeOffAuto,
  useSkin: useSkin,
  wakeUp: wakeUp,
};

// ============================================
// ROUTER
// ============================================

function handle(socket, request, callback) {
  var action = request.action;

  if (!action) {
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.LACK_PARAM), callback);
    return;
  }

  var handler = actions[action];

  if (handler && typeof handler === 'function') {
    handler(socket, request, callback);
  } else {
    logger.warn('Hero', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
