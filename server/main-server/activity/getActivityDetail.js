/**
 * ============================================================
 * GETACTIVITYDETAIL.JS - Mock Handler for activity.getActivityDetail
 * ============================================================
 * 
 * Purpose: Returns full detail for a specific activity
 * Called when user taps an activity from the activity list
 * 
 * HAR Reference (KAMUS): 13 calls captured, 12 unique activityTypes
 * Client Reference (HAKIM): main.min.js reads:
 *   act._activityType, act._image, act._name, act._des, act._pages,
 *   act._items, act._days, act._rewards, act._showType, act._brief,
 *   act.__brief, act._exRewards, act._finalItem, act._maxResignTimes,
 *   act._resignCost, act._advanceEndReward, act._rankFirst,
 *   act._rankSecondThird, act._showItems, act._disableRank,
 *   act._usedBigRewardCount, act._bigRewardCount, act._hideos,
 *   act._url, act._heroes, act._discount, act._endTime,
 *   uact._tasks, uact._items, uact._days, uact._buyTimes,
 *   uact._curCount, uact._haveGotReward, uact._rechargeTime,
 *   uact._haveClick, uact._gotRewards, uact._batchId,
 *   uact._lastRefreshTime, uact._haveBrought, uact._gotReward,
 *   uact._signedDay, uact._maxActiveDay, uact._lastActiveDate,
 *   uact._activeItem, uact._gotExRewards, uact._haveGotFinalReward,
 *   uact._resignCount, uact._freeRefreshCount, uact._totalCount,
 *   uact._canGetReward, certificationLevel (top-level)
 * 
 * CRITICAL: Response MUST include act._activityType - Hakim crashes without it
 * 
 * CHANGE END TIME (from main.min.js ActivityManager.changeEndTime):
 *   if (e.forceEndTime) { e.act._endTime = Math.min(e.act._endTime, e.forceEndTime) }
 * 
 * ACTIVITY TYPES (12 from HAR):
 *   1001 - Event Sign-in      | 1002 - Growth Quest
 *   1003 - 7-Day Top-up       | 2001 - Hero Grand Kickback
 *   2002 - Orange Hero Assem  | 2003 - New Server Discount Pack
 *   2004 - Cumulative Top-up  | 2007 - Daily accumulated top-up
 *   4003 - Temple Contest     | 5003 - Discount Today
 *   5005 - Summon Return      | 5037 - Hero Value Pack
 * 
 * Version: 2.0.0 (Verified against HAR + main.min.js)
 * ============================================================
 */

(function(window) {
    'use strict';

    var LOG = {
        prefix: '\uD83C\uDFAA [ACT-DETAIL]',
        _log: function(level, icon, message, data) {
            var timestamp = new Date().toISOString().substr(11, 12);
            var styles = {
                success: 'color: #22c55e; font-weight: bold;',
                info: 'color: #6b7280;',
                warn: 'color: #f59e0b; font-weight: bold;',
                error: 'color: #ef4444; font-weight: bold;'
            };
            var style = styles[level] || styles.info;
            var format = '%c' + this.prefix + ' ' + icon + ' [' + timestamp + '] ' + message;
            if (data !== undefined) {
                console.log(format + ' %o', style, data);
            } else {
                console.log(format, style);
            }
        },
        success: function(msg, data) { this._log('success', '\u2705', msg, data); },
        info: function(msg, data) { this._log('info', '\u2139\uFE0F', msg, data); },
        warn: function(msg, data) { this._log('warn', '\u26A0\uFE0F', msg, data); },
        error: function(msg, data) { this._log('error', '\u274C', msg, data); }
    };

    // ========================================================
    // FULL ACTIVITY DATA FROM HAR (12 known activities)
    // ========================================================
    var KNOWN_ACTS = {
    "44bd872c-65aa-4253-8a00-94bdc172f49e": {
        "_id": "44bd872c-65aa-4253-8a00-94bdc172f49e",
        "_templateId": "",
        "_templateName": "（开服）成长任务",
        "_name": "Growth Quest",
        "__name": "lang_1002_72",
        "_des": "Complete the system quests to get handsome rewards to power up fast during the event time!",
        "__des": "lang_1002_103",
        "_icon": "/activity/新用户活动/huodongnew47.png",
        "_image": "/activity/新用户活动/huodongnew26.jpg",
        "_displayIndex": 7,
        "_showRed": true,
        "_activityType": 1002,
        "_cycleType": 1,
        "_enable": true,
        "_timeType": 2,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 0,
        "_endTime": 0,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220616,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_pages": {
            "1": {
                "_title": "Blacksmith",
                "__title": "lang_1002_154",
                "_pageType": 1,
                "_tasks": {
                    "1": {
                        "_des": "Gear Compose 10 times",
                        "__des": "lang_1002_119",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 50000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Gear Compose 20 times",
                        "__des": "lang_1002_120",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 55000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Gear Compose 30 times",
                        "__des": "lang_1002_121",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 60000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Gear Compose 40 times",
                        "__des": "lang_1002_122",
                        "_target": 40,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 65000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Gear Compose 50 times",
                        "__des": "lang_1002_123",
                        "_target": 50,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 70000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Gear Compose 60 times",
                        "__des": "lang_1002_124",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 75000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Gear Compose 70 times",
                        "__des": "lang_1002_125",
                        "_target": 70,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 80000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Gear Compose 80 times",
                        "__des": "lang_1002_126",
                        "_target": 80,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 85000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Gear Compose 90 times",
                        "__des": "lang_1002_127",
                        "_target": 90,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 90000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Gear Compose 100 times",
                        "__des": "lang_1002_118",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 95000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 99
            },
            "2": {
                "_title": "Market",
                "__title": "lang_1002_40",
                "_pageType": 2,
                "_tasks": {
                    "1": {
                        "_des": "Refresh 5 times",
                        "__des": "lang_1002_16",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 50000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Refresh 10 times",
                        "__des": "lang_1002_11",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 55000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Refresh 20 times",
                        "__des": "lang_1002_12",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 60000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Refresh 30 times",
                        "__des": "lang_1002_13",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 65000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Refresh 40 times",
                        "__des": "lang_1002_14",
                        "_target": 40,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 70000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Refresh 50 times",
                        "__des": "lang_1002_15",
                        "_target": 50,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 75000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Refresh 60 times",
                        "__des": "lang_1002_17",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 80000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Refresh 70 times",
                        "__des": "lang_1002_18",
                        "_target": 70,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 85000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Refresh 80 times",
                        "__des": "lang_1002_19",
                        "_target": 80,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 90000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Refresh 90 times",
                        "__des": "lang_1002_20",
                        "_target": 90,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 95000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "11": {
                        "_des": "Refresh 100 times",
                        "__des": "lang_1002_10",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 98
            },
            "3": {
                "_title": "Tournament",
                "__title": "lang_1002_102",
                "_pageType": 3,
                "_tasks": {
                    "1": {
                        "_des": "Challenge 5 times",
                        "__des": "lang_1002_82",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Challenge 10 times",
                        "__des": "lang_1002_73",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 30
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Challenge 15 times",
                        "__des": "lang_1002_74",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 40
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Challenge 20 times",
                        "__des": "lang_1002_75",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 50
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Challenge 25 times",
                        "__des": "lang_1002_76",
                        "_target": 25,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 60
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Challenge 30 times",
                        "__des": "lang_1002_77",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 70
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Challenge 35 times",
                        "__des": "lang_1002_78",
                        "_target": 35,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 80
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Challenge 40 times",
                        "__des": "lang_1002_79",
                        "_target": 40,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 90
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Challenge 45 times",
                        "__des": "lang_1002_80",
                        "_target": 45,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 100
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Challenge 50 times",
                        "__des": "lang_1002_81",
                        "_target": 50,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 112,
                                        "_num": 110
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 96
            },
            "4": {
                "_title": "Resource",
                "__title": "lang_1002_128",
                "_pageType": 4,
                "_tasks": {
                    "1": {
                        "_des": "Successfully challenge 5 times",
                        "__des": "lang_1002_71",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 200
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Successfully challenge 10 times",
                        "__des": "lang_1002_62",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 5500
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 200
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Successfully challenge 15 times",
                        "__des": "lang_1002_63",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 6000
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 300
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Successfully challenge 20 times",
                        "__des": "lang_1002_64",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 6500
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 300
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Successfully challenge 25 times",
                        "__des": "lang_1002_65",
                        "_target": 25,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 7000
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 400
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Successfully challenge 30 times",
                        "__des": "lang_1002_66",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 7500
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 400
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Successfully challenge 35 times",
                        "__des": "lang_1002_67",
                        "_target": 35,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 8000
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 500
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Successfully challenge 40 times",
                        "__des": "lang_1002_68",
                        "_target": 40,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 8500
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 500
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Successfully challenge 45 times",
                        "__des": "lang_1002_69",
                        "_target": 45,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 9000
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 600
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Successfully challenge 50 times",
                        "__des": "lang_1002_70",
                        "_target": 50,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 131,
                                        "_num": 9500
                                    },
                                    {
                                        "_id": 132,
                                        "_num": 600
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 97
            },
            "5": {
                "_title": "Temple Trial",
                "__title": "lang_1002_104",
                "_pageType": 5,
                "_tasks": {
                    "1": {
                        "_des": "Pass Trial 10",
                        "__des": "lang_1002_131",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Pass Trial 20",
                        "__des": "lang_1002_133",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Pass Trial 30",
                        "__des": "lang_1002_135",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Pass Trial 40",
                        "__des": "lang_1002_138",
                        "_target": 40,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Pass Trial 50",
                        "__des": "lang_1002_140",
                        "_target": 50,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 3
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Pass Trial 60",
                        "__des": "lang_1002_143",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 3
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Pass Trial 70",
                        "__des": "lang_1002_145",
                        "_target": 70,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 4
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Pass Trial 80",
                        "__des": "lang_1002_148",
                        "_target": 80,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 4
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Pass Trial 90",
                        "__des": "lang_1002_151",
                        "_target": 90,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Pass Trial 100",
                        "__des": "lang_1002_129",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 95
            },
            "6": {
                "_title": "Gear Instance",
                "__title": "lang_1002_117",
                "_pageType": 6,
                "_tasks": {
                    "1": {
                        "_des": "Successfully challenge 2 times",
                        "__des": "lang_1002_58",
                        "_target": 2,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 50000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Successfully challenge 4 times",
                        "__des": "lang_1002_59",
                        "_target": 4,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 55000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Successfully challenge 6 times",
                        "__des": "lang_1002_60",
                        "_target": 6,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 60000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Successfully challenge 8 times",
                        "__des": "lang_1002_61",
                        "_target": 8,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 65000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Successfully challenge 10 times",
                        "__des": "lang_1002_52",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 70000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Successfully challenge 12 times",
                        "__des": "lang_1002_53",
                        "_target": 12,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 75000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Successfully challenge 14 times",
                        "__des": "lang_1002_54",
                        "_target": 14,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 80000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Successfully challenge 16 times",
                        "__des": "lang_1002_55",
                        "_target": 16,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 85000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Successfully challenge 18 times",
                        "__des": "lang_1002_56",
                        "_target": 18,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 90000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Successfully challenge 20 times",
                        "__des": "lang_1002_57",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 95000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 91
            },
            "7": {
                "_title": "Snake Way",
                "__title": "lang_1002_116",
                "_pageType": 7,
                "_tasks": {
                    "1": {
                        "_des": "Pass Stage 3",
                        "__des": "lang_1002_136",
                        "_target": 3,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 20000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Pass Stage 5",
                        "__des": "lang_1002_141",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 20000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Pass Stage 7",
                        "__des": "lang_1002_146",
                        "_target": 7,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 20000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Pass Stage 8",
                        "__des": "lang_1002_149",
                        "_target": 8,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 20000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Pass Stage 9",
                        "__des": "lang_1002_152",
                        "_target": 9,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 20000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Pass Stage 10",
                        "__des": "lang_1002_130",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 3
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 20000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 93
            },
            "11": {
                "_title": "Mystical Adventure",
                "__title": "lang_1002_100",
                "_pageType": 11,
                "_tasks": {
                    "1": {
                        "_des": "Go on Mystical Adventure 5 times",
                        "__des": "lang_1002_9",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 135,
                                        "_num": 100
                                    },
                                    {
                                        "_id": 139,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Go on Mystical Adventure 10 times",
                        "__des": "lang_1002_4",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 135,
                                        "_num": 200
                                    },
                                    {
                                        "_id": 139,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Go on Mystical Adventure 15 times",
                        "__des": "lang_1002_5",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 135,
                                        "_num": 300
                                    },
                                    {
                                        "_id": 139,
                                        "_num": 30
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Go on Mystical Adventure 20 times",
                        "__des": "lang_1002_6",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 135,
                                        "_num": 400
                                    },
                                    {
                                        "_id": 139,
                                        "_num": 50
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Go on Mystical Adventure 25 times",
                        "__des": "lang_1002_7",
                        "_target": 25,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 135,
                                        "_num": 500
                                    },
                                    {
                                        "_id": 139,
                                        "_num": 70
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Go on Mystical Adventure 30 times",
                        "__des": "lang_1002_8",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 135,
                                        "_num": 600
                                    },
                                    {
                                        "_id": 139,
                                        "_num": 100
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 90
            },
            "13": {
                "_title": "The Cell Game",
                "__title": "lang_4005_323",
                "_pageType": 13,
                "_tasks": {
                    "1": {
                        "_des": "Pass Trial 1",
                        "__des": "lang_1002_132",
                        "_target": 1,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4299,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 100
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Pass Trial 2",
                        "__des": "lang_1002_134",
                        "_target": 2,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4299,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 120
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Pass Trial 3",
                        "__des": "lang_1002_137",
                        "_target": 3,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4299,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 140
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Pass Trial 4",
                        "__des": "lang_1002_139",
                        "_target": 4,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4299,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 160
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Pass Trial 5",
                        "__des": "lang_1002_142",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4399,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 180
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Pass Trial 6",
                        "__des": "lang_1002_144",
                        "_target": 6,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4399,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 200
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Pass Trial 7",
                        "__des": "lang_1002_147",
                        "_target": 7,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4399,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 220
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Pass Trial 8",
                        "__des": "lang_1002_150",
                        "_target": 8,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4399,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 240
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Pass Trial 9",
                        "__des": "lang_1002_153",
                        "_target": 9,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4399,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 260
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Pass Trial 10",
                        "__des": "lang_1002_131",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 4399,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 137,
                                        "_num": 300
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 92
            },
            "14": {
                "_title": "Mark Instance",
                "__title": "lang_1002_22",
                "_pageType": 14,
                "_tasks": {
                    "1": {
                        "_des": "Successfully challenge 2 times",
                        "__des": "lang_1002_48",
                        "_target": 2,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 50
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Successfully challenge 4 times",
                        "__des": "lang_1002_49",
                        "_target": 4,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 100
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Successfully challenge 6 times",
                        "__des": "lang_1002_50",
                        "_target": 6,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 150
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Successfully challenge 8 times",
                        "__des": "lang_1002_51",
                        "_target": 8,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 200
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Successfully challenge 10 times",
                        "__des": "lang_1002_42",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 250
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Successfully challenge 12 times",
                        "__des": "lang_1002_43",
                        "_target": 12,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 300
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Successfully challenge 14 times",
                        "__des": "lang_1002_44",
                        "_target": 14,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 350
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Successfully challenge 16 times",
                        "__des": "lang_1002_45",
                        "_target": 16,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 400
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Successfully challenge 18 times",
                        "__des": "lang_1002_46",
                        "_target": 18,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 450
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Successfully challenge 20 times",
                        "__des": "lang_1002_47",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 208,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 138,
                                        "_num": 500
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 87
            },
            "15": {
                "_title": "Karin Tower",
                "__title": "lang_1002_21",
                "_pageType": 15,
                "_tasks": {
                    "1": {
                        "_des": "Challenge 5 times",
                        "__des": "lang_1002_93",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Challenge 10 times",
                        "__des": "lang_1002_83",
                        "_target": 10,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Challenge 15 times",
                        "__des": "lang_1002_84",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 30
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Challenge 20 times",
                        "__des": "lang_1002_85",
                        "_target": 20,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 40
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Challenge 25 times",
                        "__des": "lang_1002_86",
                        "_target": 25,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Challenge 30 times",
                        "__des": "lang_1002_87",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 60
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Challenge 35 times",
                        "__des": "lang_1002_88",
                        "_target": 35,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 70
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Challenge 40 times",
                        "__des": "lang_1002_89",
                        "_target": 40,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 80
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Challenge 45 times",
                        "__des": "lang_1002_90",
                        "_target": 45,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 90
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Challenge 50 times",
                        "__des": "lang_1002_91",
                        "_target": 50,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 100
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "11": {
                        "_des": "Challenge 55 times",
                        "__des": "lang_1002_92",
                        "_target": 55,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 134,
                                        "_num": 120
                                    },
                                    {
                                        "_id": 146,
                                        "_num": 3
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 88
            },
            "16": {
                "_title": "Wild Adventure",
                "__title": "lang_1002_105",
                "_pageType": 16,
                "_tasks": {
                    "1": {
                        "_des": "Acquire 15 Chests",
                        "__des": "lang_1002_110",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 100
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 50000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Acquire 30 Chests",
                        "__des": "lang_1002_111",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 120
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 55000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Acquire 45 Chests",
                        "__des": "lang_1002_112",
                        "_target": 45,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 140
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 60000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Acquire 60 Chests",
                        "__des": "lang_1002_113",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 160
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 65000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Acquire 75 Chests",
                        "__des": "lang_1002_114",
                        "_target": 75,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 180
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 70000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Acquire 90 Chests",
                        "__des": "lang_1002_115",
                        "_target": 90,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 200
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 75000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Acquire 105 Chests",
                        "__des": "lang_1002_106",
                        "_target": 105,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 220
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 80000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Acquire 120 Chests",
                        "__des": "lang_1002_107",
                        "_target": 120,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 240
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 85000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Acquire 135 Chests",
                        "__des": "lang_1002_108",
                        "_target": 135,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 260
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 90000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Acquire 150 Chests",
                        "__des": "lang_1002_109",
                        "_target": 150,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 300
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 95000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 94
            },
            "17": {
                "_title": "Time Leap",
                "__title": "lang_1002_101",
                "_pageType": 17,
                "_tasks": {
                    "1": {
                        "_des": "Complete Time Leap 3 times",
                        "__des": "lang_1002_37",
                        "_target": 3,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Complete Time Leap 6 times",
                        "__des": "lang_1002_38",
                        "_target": 6,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Complete Time Leap 9 times",
                        "__des": "lang_1002_39",
                        "_target": 9,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Complete Time Leap 12 times",
                        "__des": "lang_1002_30",
                        "_target": 12,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Complete Time Leap 15 times",
                        "__des": "lang_1002_31",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Complete Time Leap 18 times",
                        "__des": "lang_1002_32",
                        "_target": 18,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "7": {
                        "_des": "Complete Time Leap 21 times",
                        "__des": "lang_1002_33",
                        "_target": 21,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 3
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "8": {
                        "_des": "Complete Time Leap 24 times",
                        "__des": "lang_1002_34",
                        "_target": 24,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 3
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "9": {
                        "_des": "Complete Time Leap 27 times",
                        "__des": "lang_1002_35",
                        "_target": 27,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 3
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "10": {
                        "_des": "Complete Time Leap 30 times",
                        "__des": "lang_1002_36",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                },
                "_displayIndex": 89
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "91275b4b-0505-4a46-989b-cae0bd1c6c76": {
        "_id": "91275b4b-0505-4a46-989b-cae0bd1c6c76",
        "_templateId": "",
        "_templateName": "（新版开服）英雄大返利",
        "_name": "Hero Grand Kickback",
        "__name": "lang_2001_162",
        "_des": " During the event time, get the chance to make the lucky draw every time you get  1 orange or purple quality hero! (Heroes you get from Altar shop exchange and Shards Compose are not included)",
        "__des": "lang_2001_159",
        "_icon": "/activity/新服活动/huodongnew39.png",
        "_image": "/activity/新服活动/huodongnew44.jpg",
        "_displayIndex": 8,
        "_showRed": true,
        "_activityType": 2001,
        "_cycleType": 1,
        "_enable": true,
        "_timeType": 2,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 0,
        "_endTime": 0,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220587,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_des": "Obtained an orange hero",
                "__des": "lang_2001_160",
                "_target": 1,
                "_heroQualitys": [
                    5,
                    6,
                    7
                ],
                "_reward": {
                    "_normalReward": {
                        "_items": []
                    },
                    "_randReward": [
                        {
                            "_icon": "/activity/新用户活动/expcap.png",
                            "_randReward": {
                                "_groups": {
                                    "1": {
                                        "_groupId": 1,
                                        "_totalWeight": 100,
                                        "_items": [
                                            {
                                                "_itemId": 131,
                                                "_num": 6800,
                                                "_weight": 20
                                            },
                                            {
                                                "_itemId": 131,
                                                "_num": 8800,
                                                "_weight": 50
                                            },
                                            {
                                                "_itemId": 131,
                                                "_num": 18800,
                                                "_weight": 17
                                            },
                                            {
                                                "_itemId": 131,
                                                "_num": 28800,
                                                "_weight": 10
                                            },
                                            {
                                                "_itemId": 131,
                                                "_num": 68800,
                                                "_weight": 3
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "2": {
                "_des": "Obtained a purple hero",
                "__des": "lang_2001_161",
                "_target": 1,
                "_heroQualitys": [
                    4
                ],
                "_reward": {
                    "_normalReward": {
                        "_items": []
                    },
                    "_randReward": [
                        {
                            "_icon": "/activity/新用户活动/gold.png",
                            "_randReward": {
                                "_groups": {
                                    "1": {
                                        "_groupId": 1,
                                        "_totalWeight": 100,
                                        "_items": [
                                            {
                                                "_itemId": 102,
                                                "_num": 5800,
                                                "_weight": 30
                                            },
                                            {
                                                "_itemId": 102,
                                                "_num": 6800,
                                                "_weight": 35
                                            },
                                            {
                                                "_itemId": 102,
                                                "_num": 8800,
                                                "_weight": 20
                                            },
                                            {
                                                "_itemId": 102,
                                                "_num": 18800,
                                                "_weight": 12
                                            },
                                            {
                                                "_itemId": 102,
                                                "_num": 28800,
                                                "_weight": 3
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "f764c7b8-137e-4537-9209-0e7e4febea58": {
        "_id": "f764c7b8-137e-4537-9209-0e7e4febea58",
        "_templateId": "",
        "_templateName": "(新版开服)橙将集结号",
        "_name": "Orange Hero Assembly",
        "__name": "lang_2002_164",
        "_des": "  During the event time, the more orange quality heroes you unlock, the more rewards you’ll get! (Heroes you get from Altar shop exchange and Shards Compose are not included)",
        "__des": "lang_2002_163",
        "_icon": "/activity/新服活动/huodongnew40.png?rnd=171461604461607",
        "_image": "/activity/新服活动/huodongnew4.jpg?rnd=21921604461608",
        "_displayIndex": 9,
        "_showRed": true,
        "_activityType": 2002,
        "_cycleType": 1,
        "_enable": true,
        "_timeType": 2,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1604332800000,
        "_endTime": 1604937599000,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220559,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_target": 2,
                "_heroQuality": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 2
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "2": {
                "_target": 5,
                "_heroQuality": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 2
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "3": {
                "_target": 8,
                "_heroQuality": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 3
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "4": {
                "_target": 1,
                "_heroQuality": 6,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 2
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "5": {
                "_target": 2,
                "_heroQuality": 6,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 3
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "6": {
                "_target": 3,
                "_heroQuality": 6,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 4
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "7": {
                "_target": 4,
                "_heroQuality": 6,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 6
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "8": {
                "_target": 6,
                "_heroQuality": 6,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 10
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "9": {
                "_target": 12,
                "_heroQuality": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 3
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "10": {
                "_target": 18,
                "_heroQuality": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 5
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "11": {
                "_target": 25,
                "_heroQuality": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 5
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "12": {
                "_target": 35,
                "_heroQuality": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 8
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "3ad3406d-1c09-47f3-8ba5-86b0d5d90d93": {
        "_id": "3ad3406d-1c09-47f3-8ba5-86b0d5d90d93",
        "_templateId": "",
        "_templateName": "（开服）7日任意充",
        "_name": "7-Day Top-up At Will",
        "__name": "lang_1003_156",
        "_des": "",
        "__des": "",
        "_icon": "/activity/新用户活动/huodongnew372.png?rnd=558541576031269",
        "_image": "/activity/新用户活动/huodongnew389.jpg?rnd=759631576031273",
        "_displayIndex": 85,
        "_showRed": true,
        "_activityType": 1003,
        "_cycleType": 1,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220585,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_des": "Daily recharge for day 1 gift",
                "__des": "lang_1003_440",
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 88
                            },
                            {
                                "_id": 122,
                                "_num": 5
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "2": {
                "_des": "Daily recharge for day 2 gift",
                "__des": "lang_1003_441",
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 88
                            },
                            {
                                "_id": 123,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "3": {
                "_des": "Daily recharge for day 3 gift",
                "__des": "lang_1003_442",
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 88
                            },
                            {
                                "_id": 122,
                                "_num": 5
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "4": {
                "_des": "Daily recharge for day 4 gift",
                "__des": "lang_1003_443",
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 88
                            },
                            {
                                "_id": 123,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "5": {
                "_des": "Daily recharge for day 5 gift",
                "__des": "lang_1003_444",
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 88
                            },
                            {
                                "_id": 122,
                                "_num": 5
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "6": {
                "_des": "Daily recharge for day 6 gift",
                "__des": "lang_1003_445",
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 88
                            },
                            {
                                "_id": 123,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "7": {
                "_des": "Daily recharge for day 7 gift",
                "__des": "lang_1003_446",
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 88
                            },
                            {
                                "_id": 122,
                                "_num": 5
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            }
        },
        "_finalItem": {
            "_des": "Continuous recharge for 7 days gift",
            "__des": "lang_1003_452",
            "_reward": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 123,
                            "_num": 10
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            }
        },
        "_maxResignTimes": 2,
        "_resignCost": {
            "1": 300,
            "2": 500
        },
        "_advanceEndReward": {},
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "97114e80-830c-4d63-bb72-fb3a30eb67e8": {
        "_id": "97114e80-830c-4d63-bb72-fb3a30eb67e8",
        "_templateId": "",
        "_templateName": "（开服）新服特惠包（新）",
        "_name": "New Server Discount Pack",
        "__name": "lang_2003_165",
        "_des": "",
        "__des": "",
        "_icon": "/activity/新服活动/huodongnew42.png",
        "_image": "/activity/新服活动/huodongnew41.jpg",
        "_displayIndex": 2,
        "_showRed": true,
        "_activityType": 2003,
        "_cycleType": 2,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220643,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_limit": 7,
                "_price": 4.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 300
                            },
                            {
                                "_id": 101,
                                "_num": 300
                            },
                            {
                                "_id": 132,
                                "_num": 5000
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "30 New Server Breakthrough Discount Pack",
                "__goodName": "lang_2003_500"
            },
            "2": {
                "_limit": 5,
                "_price": 4.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 300
                            },
                            {
                                "_id": 101,
                                "_num": 300
                            },
                            {
                                "_id": 501,
                                "_num": 6
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "30 New Server Awaken Discount Pack",
                "__goodName": "lang_2003_501"
            },
            "3": {
                "_limit": 5,
                "_price": 14.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 980
                            },
                            {
                                "_id": 101,
                                "_num": 980
                            },
                            {
                                "_id": 123,
                                "_num": 5
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "98 New Server Advanced SummonOrb Discount Pack3",
                "__goodName": "lang_2003_507"
            },
            "4": {
                "_limit": 8,
                "_price": 14.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 980
                            },
                            {
                                "_id": 101,
                                "_num": 980
                            },
                            {
                                "_id": 132,
                                "_num": 10000
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "98 New Server Breakthrough Discount Pack1",
                "__goodName": "lang_2003_505"
            },
            "5": {
                "_limit": 5,
                "_price": 14.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 980
                            },
                            {
                                "_id": 101,
                                "_num": 980
                            },
                            {
                                "_id": 501,
                                "_num": 18
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "98 New Server Awaken Discount Pack2",
                "__goodName": "lang_2003_506"
            },
            "6": {
                "_limit": 5,
                "_price": 59.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 3880
                            },
                            {
                                "_id": 101,
                                "_num": 3880
                            },
                            {
                                "_id": 123,
                                "_num": 22
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "388 New Server SummonOrb Discount Pack",
                "__goodName": "lang_2003_502"
            },
            "7": {
                "_limit": 8,
                "_price": 59.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 3880
                            },
                            {
                                "_id": 101,
                                "_num": 3880
                            },
                            {
                                "_id": 501,
                                "_num": 68
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "388 New Server Awaken Discount Pack",
                "__goodName": "lang_2003_503"
            },
            "8": {
                "_limit": 4,
                "_price": 89.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 5880
                            },
                            {
                                "_id": 101,
                                "_num": 5880
                            },
                            {
                                "_id": 132,
                                "_num": 60000
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                },
                "_goodName": "588 New Server Breakthrough Discount Pack",
                "__goodName": "lang_2003_504"
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "1c19108c-b90b-4918-95fb-b401a799b414": {
        "_id": "1c19108c-b90b-4918-95fb-b401a799b414",
        "_templateId": "",
        "_templateName": "新服特惠三选一礼包",
        "_name": "Hero Value Pack",
        "__name": "lang_5037_1604",
        "_des": "",
        "__des": "",
        "_icon": "/activity/新服活动/xinfuyingxiongtehui_rukou.png?rnd=851641672116391",
        "_image": "/activity/新服活动/yingxiongtehui_1.jpg?rnd=134041672116403",
        "_displayIndex": 0,
        "_showRed": true,
        "_activityType": 5037,
        "_cycleType": 2,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 9,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 7,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220714,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_showType": 1,
        "_items": {
            "1": {
                "_limit": 1,
                "_bg": "/activity/新服活动/xinfuyingxiongtehui_3.png?rnd=918311672116372",
                "_goodName": "Group SS Heroes 1 of 3 Pack",
                "__goodName": "lang_5037_1827",
                "_price": 19.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 496,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "2": {
                "_limit": 1,
                "_bg": "/activity/新服活动/xinfuyingxiongtehui_4.png?rnd=587851672116377",
                "_goodName": "Bleeding SS Heroes 1 of 3 Pack",
                "__goodName": "lang_5037_1826",
                "_price": 19.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 498,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "3": {
                "_limit": 1,
                "_bg": "/activity/新服活动/xinfuyingxiongtehui_5.png?rnd=471931672116379",
                "_goodName": "Single SS Heroes 1 of 3 Pack",
                "__goodName": "lang_5037_1828",
                "_price": 19.99,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 497,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 1
    },
    "2c6125f1-c012-492d-9022-b8e3f29fbf25": {
        "_id": "2c6125f1-c012-492d-9022-b8e3f29fbf25",
        "_templateId": "",
        "_templateName": "（开服）今日特价（新）",
        "_name": "Discount Today",
        "__name": "lang_5003_342",
        "_des": "",
        "__des": "",
        "_icon": "/activity/强者之路/huodongnew205.png?rnd=574051578983873",
        "_image": "/activity/强者之路/huodong201new.jpg?rnd=565591583918819",
        "_displayIndex": 3,
        "_showRed": true,
        "_activityType": 5003,
        "_cycleType": 2,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220614,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_items": {
            "0": {
                "_randItems": {
                    "1": {
                        "_id": 1,
                        "_buyType": 2,
                        "_cost": {
                            "_items": {
                                "101": {
                                    "_id": 101,
                                    "_num": 1
                                }
                            }
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 102,
                                        "_num": 50000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 0,
                        "_discount": "90% Off",
                        "__discount": "lang_5003_620",
                        "_weight": 25,
                        "_goodName": "Coin",
                        "__goodName": "lang_5003_624"
                    },
                    "2": {
                        "_id": 2,
                        "_buyType": 2,
                        "_cost": {
                            "_items": {
                                "101": {
                                    "_id": 101,
                                    "_num": 3
                                }
                            }
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 122,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 0,
                        "_discount": "90% Off",
                        "__discount": "lang_5003_620",
                        "_weight": 25,
                        "_goodName": "Normal Summon Orb",
                        "__goodName": "lang_5003_622"
                    },
                    "3": {
                        "_id": 3,
                        "_buyType": 2,
                        "_cost": {
                            "_items": {
                                "101": {
                                    "_id": 101,
                                    "_num": 5
                                }
                            }
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 146,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 0,
                        "_discount": "90% Off",
                        "__discount": "lang_5003_620",
                        "_weight": 25,
                        "_goodName": "Senzu Bean",
                        "__goodName": "lang_5003_621"
                    },
                    "4": {
                        "_id": 4,
                        "_buyType": 2,
                        "_cost": {
                            "_items": {
                                "101": {
                                    "_id": 101,
                                    "_num": 9
                                }
                            }
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 111,
                                        "_num": 30
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 0,
                        "_discount": "90% Off",
                        "__discount": "lang_5003_620",
                        "_weight": 25,
                        "_goodName": "Soul Stone",
                        "__goodName": "lang_5003_623"
                    }
                },
                "_randGroup": {
                    "_groups": {
                        "1": {
                            "_groupId": 1,
                            "_totalWeight": 100,
                            "_items": [
                                {
                                    "_itemId": 1,
                                    "_num": 1,
                                    "_weight": 25
                                },
                                {
                                    "_itemId": 2,
                                    "_num": 1,
                                    "_weight": 25
                                },
                                {
                                    "_itemId": 3,
                                    "_num": 1,
                                    "_weight": 25
                                },
                                {
                                    "_itemId": 4,
                                    "_num": 1,
                                    "_weight": 25
                                }
                            ]
                        }
                    }
                }
            },
            "1": {
                "_randItems": {
                    "1": {
                        "_id": 1,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 4000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 180000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 0.99,
                        "_discount": "50% Off",
                        "__discount": "lang_5003_598",
                        "_weight": 50,
                        "_goodName": "Breakthrough Capsule",
                        "__goodName": "lang_5003_580"
                    },
                    "2": {
                        "_id": 2,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 180
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 60000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 0.99,
                        "_discount": "70% Off",
                        "__discount": "lang_5012_430",
                        "_weight": 50,
                        "_goodName": "180 Gem",
                        "__goodName": "lang_5003_565"
                    }
                },
                "_randGroup": {
                    "_groups": {
                        "1": {
                            "_groupId": 1,
                            "_totalWeight": 100,
                            "_items": [
                                {
                                    "_itemId": 1,
                                    "_num": 1,
                                    "_weight": 50
                                },
                                {
                                    "_itemId": 2,
                                    "_num": 1,
                                    "_weight": 50
                                }
                            ]
                        }
                    }
                }
            },
            "2": {
                "_randItems": {
                    "1": {
                        "_id": 1,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 6000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 380000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 1.99,
                        "_discount": "60% Off",
                        "__discount": "lang_5012_431",
                        "_weight": 50,
                        "_goodName": "Breakthrough Capsule",
                        "__goodName": "lang_5003_580"
                    },
                    "2": {
                        "_id": 2,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 101,
                                        "_num": 360
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 120000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 1.99,
                        "_discount": "70% Off",
                        "__discount": "lang_5012_430",
                        "_weight": 50,
                        "_goodName": "360 Gem",
                        "__goodName": "lang_5003_597"
                    }
                },
                "_randGroup": {
                    "_groups": {
                        "1": {
                            "_groupId": 1,
                            "_totalWeight": 100,
                            "_items": [
                                {
                                    "_itemId": 1,
                                    "_num": 1,
                                    "_weight": 50
                                },
                                {
                                    "_itemId": 2,
                                    "_num": 1,
                                    "_weight": 50
                                }
                            ]
                        }
                    }
                }
            },
            "3": {
                "_randItems": {
                    "1": {
                        "_id": 1,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 3
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 2.99,
                        "_discount": "80% Off",
                        "__discount": "lang_5012_429",
                        "_weight": 33,
                        "_goodName": "Advanced Summon Orb",
                        "__goodName": "lang_5003_603"
                    },
                    "2": {
                        "_id": 2,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 139,
                                        "_num": 500
                                    },
                                    {
                                        "_id": 135,
                                        "_num": 1200
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 2.99,
                        "_discount": "70% Off",
                        "__discount": "lang_5012_430",
                        "_weight": 33,
                        "_goodName": "Jade of Potara",
                        "__goodName": "lang_5003_577"
                    },
                    "3": {
                        "_id": 3,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 136,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 2.99,
                        "_discount": "70% Off",
                        "__discount": "lang_5012_430",
                        "_weight": 34,
                        "_goodName": "Energy Stone",
                        "__goodName": "lang_5003_601"
                    }
                },
                "_randGroup": {
                    "_groups": {
                        "1": {
                            "_groupId": 1,
                            "_totalWeight": 100,
                            "_items": [
                                {
                                    "_itemId": 1,
                                    "_num": 1,
                                    "_weight": 33
                                },
                                {
                                    "_itemId": 2,
                                    "_num": 1,
                                    "_weight": 33
                                },
                                {
                                    "_itemId": 3,
                                    "_num": 1,
                                    "_weight": 34
                                }
                            ]
                        }
                    }
                }
            },
            "4": {
                "_randItems": {
                    "1": {
                        "_id": 1,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 8
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 4.99,
                        "_discount": "80% Off",
                        "__discount": "lang_5012_429",
                        "_weight": 50,
                        "_goodName": "Advanced Summon Orb",
                        "__goodName": "lang_5003_603"
                    },
                    "2": {
                        "_id": 2,
                        "_buyType": 1,
                        "_cost": {
                            "_items": {}
                        },
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 139,
                                        "_num": 800
                                    },
                                    {
                                        "_id": 135,
                                        "_num": 2000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        },
                        "_price": 4.99,
                        "_discount": "70% Off",
                        "__discount": "lang_5012_430",
                        "_weight": 50,
                        "_goodName": "Jade of Potara",
                        "__goodName": "lang_5003_577"
                    }
                },
                "_randGroup": {
                    "_groups": {
                        "1": {
                            "_groupId": 1,
                            "_totalWeight": 100,
                            "_items": [
                                {
                                    "_itemId": 1,
                                    "_num": 1,
                                    "_weight": 50
                                },
                                {
                                    "_itemId": 2,
                                    "_num": 1,
                                    "_weight": 50
                                }
                            ]
                        }
                    }
                }
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "5cd9f34d-18ac-445c-b782-5ced80f10c10": {
        "_id": "5cd9f34d-18ac-445c-b782-5ced80f10c10",
        "_templateId": "",
        "_templateName": "（开服）累充豪礼（新）",
        "_name": "Cumulative Top-up Gift",
        "__name": "lang_2004_170",
        "_des": "  During the event time, make required amount of top-up to claim ultimate rewards!",
        "__des": "lang_2004_166",
        "_icon": "/activity/强者之路/huodongnew107.png",
        "_image": "/activity/每周累充/topUp1.jpg?rnd=310081649211036",
        "_displayIndex": 4,
        "_showRed": true,
        "_activityType": 2004,
        "_cycleType": 2,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220710,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_des": "",
                "__des": "",
                "_target": 0.9,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 131,
                                "_num": 20000
                            },
                            {
                                "_id": 132,
                                "_num": 800
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "2": {
                "_des": "",
                "__des": "",
                "_target": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 100
                            },
                            {
                                "_id": 132,
                                "_num": 2500
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "3": {
                "_des": "",
                "__des": "",
                "_target": 10,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 101,
                                "_num": 200
                            },
                            {
                                "_id": 132,
                                "_num": 5000
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "4": {
                "_des": "",
                "__des": "",
                "_target": 20,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 3
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "5": {
                "_des": " <font color=0x000000>Activate Super Ultimate</font> <font color=0xff0000>High Strike</font><font color=0x000001></font>",
                "__des": "lang_2004_168",
                "_target": 40,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 1405,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "6": {
                "_des": " <font color=0x000000>Activate Super Ultimate</font> <font color=0xff0000>Planet Destroyer</font><font color=0x000000></font>",
                "__des": "lang_2004_167",
                "_target": 60,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 1404,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "7": {
                "_des": "",
                "__des": "",
                "_target": 90,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 123,
                                "_num": 10
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "8": {
                "_des": "",
                "__des": "",
                "_target": 150,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 4401,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "9": {
                "_des": "",
                "__des": "",
                "_target": 250,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 1508,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "10": {
                "_des": "",
                "__des": "",
                "_target": 600,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 612,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "11": {
                "_des": "",
                "__des": "",
                "_target": 1000,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 1600,
                                "_num": 1
                            },
                            {
                                "_id": 4401,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            }
        },
        "_rankFirst": {
            "_des": "",
            "__des": "",
            "_target": 0,
            "_reward": {
                "_normalReward": {
                    "_items": []
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            }
        },
        "_rankSecondThird": {
            "_des": "",
            "__des": "",
            "_target": 0,
            "_reward": {
                "_normalReward": {
                    "_items": []
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            }
        },
        "_showItems": [
            612
        ],
        "_disableRank": true,
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 1
    },
    "205e06d9-fcb2-43f1-929e-16b4f4de2fcb": {
        "_id": "205e06d9-fcb2-43f1-929e-16b4f4de2fcb",
        "_templateId": "",
        "_templateName": "（新版开服）每日累充",
        "_name": "Daily accumulated top-up",
        "__name": "lang_2007_678",
        "_des": "You can get generous rewards if you reach a certain ammount in daily accumulated top-up during the activity!",
        "__des": "lang_2007_679",
        "_icon": "/activity/新服活动/huodongnew35.png?rnd=649231590140442",
        "_image": "/activity/新服活动/huodongnew29.jpg?rnd=15451590140452",
        "_displayIndex": 6,
        "_showRed": true,
        "_activityType": 2007,
        "_cycleType": 2,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220526,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_days": {
            "1": {
                "_items": {
                    "1": {
                        "_des": "Total top-up $0.99",
                        "__des": "lang_2007_509",
                        "_target": 0.99,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Total top-up $5",
                        "__des": "lang_2007_509",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 131,
                                        "_num": 50000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Total top-up $15",
                        "__des": "lang_2007_509",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 200000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Total top-up $30",
                        "__des": "lang_2007_509",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Total top-up $60",
                        "__des": "lang_2007_509",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Total top-up $100",
                        "__des": "lang_2007_509",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                }
            },
            "2": {
                "_items": {
                    "1": {
                        "_des": "Total top-up $0.99",
                        "__des": "lang_2007_509",
                        "_target": 0.99,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Total top-up $5",
                        "__des": "lang_2007_509",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 131,
                                        "_num": 50000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Total top-up $15",
                        "__des": "lang_2007_509",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 200000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Total top-up $30",
                        "__des": "lang_2007_509",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Total top-up $60",
                        "__des": "lang_2007_509",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Total top-up $100",
                        "__des": "lang_2007_509",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                }
            },
            "3": {
                "_items": {
                    "1": {
                        "_des": "Total top-up $0.99",
                        "__des": "lang_2007_509",
                        "_target": 0.99,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Total top-up $5",
                        "__des": "lang_2007_509",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 131,
                                        "_num": 50000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Total top-up $15",
                        "__des": "lang_2007_509",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 200000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Total top-up $30",
                        "__des": "lang_2007_509",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Total top-up $60",
                        "__des": "lang_2007_509",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Total top-up $100",
                        "__des": "lang_2007_509",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                }
            },
            "4": {
                "_items": {
                    "1": {
                        "_des": "Total top-up $0.99",
                        "__des": "lang_2007_509",
                        "_target": 0.99,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Total top-up $5",
                        "__des": "lang_2007_509",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 131,
                                        "_num": 50000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Total top-up $15",
                        "__des": "lang_2007_509",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 200000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Total top-up $30",
                        "__des": "lang_2007_509",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Total top-up $60",
                        "__des": "lang_2007_509",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Total top-up $100",
                        "__des": "lang_2007_509",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                }
            },
            "5": {
                "_items": {
                    "1": {
                        "_des": "Total top-up $0.99",
                        "__des": "lang_2007_509",
                        "_target": 0.99,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Total top-up $5",
                        "__des": "lang_2007_509",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 131,
                                        "_num": 50000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Total top-up $15",
                        "__des": "lang_2007_509",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 200000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Total top-up $30",
                        "__des": "lang_2007_509",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Total top-up $60",
                        "__des": "lang_2007_509",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Total top-up $100",
                        "__des": "lang_2007_509",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                }
            },
            "6": {
                "_items": {
                    "1": {
                        "_des": "Total top-up $0.99",
                        "__des": "lang_2007_509",
                        "_target": 0.99,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Total top-up $5",
                        "__des": "lang_2007_509",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 131,
                                        "_num": 50000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Total top-up $15",
                        "__des": "lang_2007_509",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 200000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Total top-up $30",
                        "__des": "lang_2007_509",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Total top-up $60",
                        "__des": "lang_2007_509",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Total top-up $100",
                        "__des": "lang_2007_509",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                }
            },
            "7": {
                "_items": {
                    "1": {
                        "_des": "Total top-up $0.99",
                        "__des": "lang_2007_509",
                        "_target": 0.99,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 1
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "2": {
                        "_des": "Total top-up $5",
                        "__des": "lang_2007_509",
                        "_target": 5,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 132,
                                        "_num": 5000
                                    },
                                    {
                                        "_id": 131,
                                        "_num": 50000
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 100000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "3": {
                        "_des": "Total top-up $15",
                        "__des": "lang_2007_509",
                        "_target": 15,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    },
                                    {
                                        "_id": 122,
                                        "_num": 5
                                    },
                                    {
                                        "_id": 102,
                                        "_num": 200000
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "4": {
                        "_des": "Total top-up $30",
                        "__des": "lang_2007_509",
                        "_target": 30,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2851,
                                        "_num": 50
                                    },
                                    {
                                        "_id": 123,
                                        "_num": 2
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "5": {
                        "_des": "Total top-up $60",
                        "__des": "lang_2007_509",
                        "_target": 60,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 10
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 10
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    },
                    "6": {
                        "_des": "Total top-up $100",
                        "__des": "lang_2007_509",
                        "_target": 100,
                        "_reward": {
                            "_normalReward": {
                                "_items": [
                                    {
                                        "_id": 2861,
                                        "_num": 20
                                    },
                                    {
                                        "_id": 2851,
                                        "_num": 20
                                    }
                                ]
                            },
                            "_randReward": [],
                            "_anyReward": {
                                "_icon": "",
                                "_anyReward": []
                            }
                        }
                    }
                }
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "c53f9ca8-9262-4d97-9219-fd514fca1b5d": {
        "_id": "c53f9ca8-9262-4d97-9219-fd514fca1b5d",
        "_templateId": "",
        "_templateName": "（新版开服）抽卡送豪礼",
        "_name": "Summon Return ",
        "__name": "lang_5005_347",
        "_des": "  During the event time, with certain Advanced Summon or Theme Card Pool draw count to get appealing rewards!",
        "__des": "lang_5005_726",
        "_icon": "/activity/主题卡活动/huodongnew234.png?rnd=680761591703911",
        "_image": "/activity/主题卡活动/huodongnew233.jpg?rnd=704381591703917",
        "_displayIndex": 10,
        "_showRed": true,
        "_activityType": 5005,
        "_cycleType": 2,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 2,
        "_durationDay": 2,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774929600000,
        "_endTime": 1775102399999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220561,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_des": "",
                "__des": "",
                "_target": 30,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 2851,
                                "_num": 50
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "2": {
                "_des": "",
                "__des": "",
                "_target": 50,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 2861,
                                "_num": 10
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "3": {
                "_des": "",
                "__des": "",
                "_target": 70,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 2861,
                                "_num": 15
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "4": {
                "_des": "",
                "__des": "",
                "_target": 90,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 2861,
                                "_num": 15
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "5": {
                "_des": "",
                "__des": "",
                "_target": 120,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 2861,
                                "_num": 20
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "6": {
                "_des": "",
                "__des": "",
                "_target": 150,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 3301,
                                "_num": 1
                            },
                            {
                                "_id": 3302,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "7": {
                "_des": "",
                "__des": "",
                "_target": 180,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 3303,
                                "_num": 1
                            },
                            {
                                "_id": 3304,
                                "_num": 1
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    },
    "67b6ee00-3eb6-40f6-b2fb-dfbb29d6827d": {
        "_id": "67b6ee00-3eb6-40f6-b2fb-dfbb29d6827d",
        "_templateId": "",
        "_templateName": "（新版开服）神殿争先",
        "_name": "Temple Contest",
        "__name": "lang_4003_319",
        "_des": "1) Get reward with Temple Trial Stage clearing rank. The higher you ranked, the better rewards you’ll get!<br/>2) For players with same trial stage clearing counts, early clearance will get you rank higher.",
        "__des": "lang_4003_390",
        "_icon": "/activity/抢占先机/huodongnew142.png?rnd=561581579242342",
        "_image": "/activity/抢占先机/huodongnew149.jpg?rnd=281691579242332",
        "_displayIndex": 9,
        "_showRed": true,
        "_activityType": 4003,
        "_cycleType": 4,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 4,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774756800000,
        "_endTime": 1775102399999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220644,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_brief": "",
        "__brief": "",
        "_items": {
            "1": {
                "_startRank": 1,
                "_endRank": 1,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 10000
                            },
                            {
                                "_id": 139,
                                "_num": 2000
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "2": {
                "_startRank": 2,
                "_endRank": 2,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 8000
                            },
                            {
                                "_id": 139,
                                "_num": 1500
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "3": {
                "_startRank": 3,
                "_endRank": 3,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 6000
                            },
                            {
                                "_id": 139,
                                "_num": 1300
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "4": {
                "_startRank": 4,
                "_endRank": 4,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 5000
                            },
                            {
                                "_id": 139,
                                "_num": 1100
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "5": {
                "_startRank": 5,
                "_endRank": 5,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 4000
                            },
                            {
                                "_id": 139,
                                "_num": 1000
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "6": {
                "_startRank": 6,
                "_endRank": 10,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 3000
                            },
                            {
                                "_id": 139,
                                "_num": 800
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "7": {
                "_startRank": 11,
                "_endRank": 20,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 2000
                            },
                            {
                                "_id": 139,
                                "_num": 600
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "8": {
                "_startRank": 21,
                "_endRank": 50,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 1500
                            },
                            {
                                "_id": 139,
                                "_num": 400
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "9": {
                "_startRank": 51,
                "_endRank": 100,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 1000
                            },
                            {
                                "_id": 139,
                                "_num": 300
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "10": {
                "_startRank": 101,
                "_endRank": 200,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 800
                            },
                            {
                                "_id": 139,
                                "_num": 200
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            },
            "11": {
                "_startRank": 201,
                "_endRank": 500,
                "_reward": {
                    "_normalReward": {
                        "_items": [
                            {
                                "_id": 135,
                                "_num": 600
                            },
                            {
                                "_id": 139,
                                "_num": 100
                            }
                        ]
                    },
                    "_randReward": [],
                    "_anyReward": {
                        "_icon": "",
                        "_anyReward": []
                    }
                }
            }
        },
        "__ruleDes": null,
        "_displayAdvance": 5,
        "_displayExtend": 1
    },
    "b56bde3a-2312-41a7-b920-a61f75e73f2e": {
        "_id": "b56bde3a-2312-41a7-b920-a61f75e73f2e",
        "_templateId": "",
        "_templateName": "开服七日登陆有礼",
        "_name": "Event Sign-in",
        "__name": "lang_1001_1002",
        "_des": "",
        "__des": "",
        "_icon": "/activity/新用户活动/huodongnew43.png?rnd=92791669347101",
        "_image": "/activity/新用户活动/huodongnew31.jpg?rnd=954271669347116",
        "_displayIndex": 9999,
        "_showRed": false,
        "_activityType": 1001,
        "_cycleType": 8,
        "_enable": true,
        "_timeType": 1,
        "_newUserUsing": true,
        "_isloop": false,
        "_loopInterval": 0,
        "_startDay": 0,
        "_durationDay": 7,
        "_oldUserVip": 0,
        "_oldUserServerOpenDay": 0,
        "_oldUserServerOpenDayEnd": 0,
        "_oldUserOfflineDay": 0,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_loopCount": 0,
        "_loopTag": "",
        "_timestamp": 1774802220612,
        "_hideos": "",
        "_limitReward": {
            "_items": {}
        },
        "_rewards": {
            "1": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 101,
                            "_num": 100
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            },
            "2": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 1407,
                            "_num": 1
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            },
            "3": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 101,
                            "_num": 100
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            },
            "4": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 123,
                            "_num": 1
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            },
            "5": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 101,
                            "_num": 100
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            },
            "6": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 123,
                            "_num": 1
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            },
            "7": {
                "_normalReward": {
                    "_items": [
                        {
                            "_id": 1419,
                            "_num": 1
                        }
                    ]
                },
                "_randReward": [],
                "_anyReward": {
                    "_icon": "",
                    "_anyReward": []
                }
            }
        },
        "_exRewards": {},
        "__ruleDes": null,
        "_displayAdvance": 0,
        "_displayExtend": 0
    }
};

    // ========================================================
    // UACT TEMPLATES - Fresh user state per activityType
    // ========================================================
    var UACT_TEMPLATES = {
    "1002": {
        "_activityType": 1002,
        "_startTime": 1775016000000,
        "_endTime": 1775620799999,
        "_activityId": "44bd872c-65aa-4253-8a00-94bdc172f49e",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_tasks": {
            "1": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "2": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "11": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "3": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "4": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "5": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "6": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "7": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "11": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "13": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "14": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "15": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "11": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "16": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            },
            "17": {
                "1": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "2": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "3": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "4": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "5": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "6": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "7": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "8": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "9": {
                    "_curCount": 0,
                    "_haveGotReward": false
                },
                "10": {
                    "_curCount": 0,
                    "_haveGotReward": false
                }
            }
        }
    },
    "2001": {
        "_activityType": 2001,
        "_startTime": 1775016000000,
        "_endTime": 1775620799999,
        "_activityId": "91275b4b-0505-4a46-989b-cae0bd1c6c76",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_leftTimes": 0,
                "_curCount": 0
            },
            "2": {
                "_leftTimes": 0,
                "_curCount": 0
            }
        }
    },
    "2002": {
        "_activityType": 2002,
        "_startTime": 1775016000000,
        "_endTime": 1775620799999,
        "_activityId": "f764c7b8-137e-4537-9209-0e7e4febea58",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "2": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "3": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "4": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "5": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "6": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "7": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "8": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "9": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "10": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "11": {
                "_curCount": 0,
                "_haveGotReward": false
            },
            "12": {
                "_curCount": 0,
                "_haveGotReward": false
            }
        }
    },
    "1003": {
        "_activityType": 1003,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_activityId": "3ad3406d-1c09-47f3-8ba5-86b0d5d90d93",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_items": {
            "1": {
                "_canGetReward": false,
                "_haveGotReward": false
            },
            "2": {
                "_canGetReward": false,
                "_haveGotReward": false
            },
            "3": {
                "_canGetReward": false,
                "_haveGotReward": false
            },
            "4": {
                "_canGetReward": false,
                "_haveGotReward": false
            },
            "5": {
                "_canGetReward": false,
                "_haveGotReward": false
            },
            "6": {
                "_canGetReward": false,
                "_haveGotReward": false
            },
            "7": {
                "_canGetReward": false,
                "_haveGotReward": false
            }
        },
        "_haveGotFinalReward": false,
        "_resignCount": 0
    },
    "2003": {
        "_activityType": 2003,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_activityId": "97114e80-830c-4d63-bb72-fb3a30eb67e8",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_buyTimes": {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0
        }
    },
    "5037": {
        "_activityType": 5037,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_activityId": "1c19108c-b90b-4918-95fb-b401a799b414",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_buyTimes": {}
    },
    "5003": {
        "_activityType": 5003,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_activityId": "2c6125f1-c012-492d-9022-b8e3f29fbf25",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_items": {
            "0": {
                "_goodId": 0,
                "_haveBrought": false
            },
            "1": {
                "_goodId": 0,
                "_haveBrought": false
            },
            "2": {
                "_goodId": 0,
                "_haveBrought": false
            },
            "3": {
                "_goodId": 0,
                "_haveBrought": false
            },
            "4": {
                "_goodId": 0,
                "_haveBrought": false
            }
        },
        "_batchId": "",
        "_lastRefreshTime": 0
    },
    "2004": {
        "_activityType": 2004,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_activityId": "5cd9f34d-18ac-445c-b782-5ced80f10c10",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_curCount": 0,
        "_haveGotReward": {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
            "5": false,
            "6": false,
            "7": false,
            "8": false,
            "9": false,
            "10": false,
            "11": false
        },
        "_rechargeTime": 0
    },
    "2007": {
        "_activityType": 2007,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_activityId": "205e06d9-fcb2-43f1-929e-16b4f4de2fcb",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_days": {
            "1": {
                "_curCount": 0,
                "_haveGotReward": {}
            },
            "2": {
                "_curCount": 0,
                "_haveGotReward": {}
            },
            "3": {
                "_curCount": 0,
                "_haveGotReward": {}
            },
            "4": {
                "_curCount": 0,
                "_haveGotReward": {}
            },
            "5": {
                "_curCount": 0,
                "_haveGotReward": {}
            },
            "6": {
                "_curCount": 0,
                "_haveGotReward": {}
            },
            "7": {
                "_curCount": 0,
                "_haveGotReward": {}
            }
        }
    },
    "5005": {
        "_activityType": 5005,
        "_startTime": 1774929600000,
        "_endTime": 1775102399999,
        "_activityId": "c53f9ca8-9262-4d97-9219-fd514fca1b5d",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_curCount": 0,
        "_haveGotReward": {}
    },
    "4003": {
        "_activityType": 4003,
        "_startTime": 1774756800000,
        "_endTime": 1775102399999,
        "_activityId": "67b6ee00-3eb6-40f6-b2fb-dfbb29d6827d",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        }
    },
    "1001": {
        "_activityType": 1001,
        "_startTime": 1774756800000,
        "_endTime": 1775361599999,
        "_activityId": "b56bde3a-2312-41a7-b920-a61f75e73f2e",
        "_loopTag": "",
        "_haveClick": true,
        "_gotRewards": {
            "_items": {}
        },
        "_activeItem": [],
        "_maxActiveDay": 0,
        "_lastActiveDate": 0,
        "_gotExRewards": [],
        "_signedDay": 0
    }
};

    // ========================================================
    // ACT TYPE MAP - actId -> {type, cycle}
    // ========================================================
    var ACT_TYPE_MAP = {
    "44bd872c-65aa-4253-8a00-94bdc172f49e": {
        "type": 1002,
        "cycle": 1
    },
    "91275b4b-0505-4a46-989b-cae0bd1c6c76": {
        "type": 2001,
        "cycle": 1
    },
    "f764c7b8-137e-4537-9209-0e7e4febea58": {
        "type": 2002,
        "cycle": 1
    },
    "3ad3406d-1c09-47f3-8ba5-86b0d5d90d93": {
        "type": 1003,
        "cycle": 1
    },
    "97114e80-830c-4d63-bb72-fb3a30eb67e8": {
        "type": 2003,
        "cycle": 2
    },
    "1c19108c-b90b-4918-95fb-b401a799b414": {
        "type": 5037,
        "cycle": 2
    },
    "2c6125f1-c012-492d-9022-b8e3f29fbf25": {
        "type": 5003,
        "cycle": 2
    },
    "5cd9f34d-18ac-445c-b782-5ced80f10c10": {
        "type": 2004,
        "cycle": 2
    },
    "205e06d9-fcb2-43f1-929e-16b4f4de2fcb": {
        "type": 2007,
        "cycle": 2
    },
    "c53f9ca8-9262-4d97-9219-fd514fca1b5d": {
        "type": 5005,
        "cycle": 2
    },
    "67b6ee00-3eb6-40f6-b2fb-dfbb29d6827d": {
        "type": 4003,
        "cycle": 4
    },
    "b56bde3a-2312-41a7-b920-a61f75e73f2e": {
        "type": 1001,
        "cycle": 8
    }
};

    // ========================================================
    // EXTRA RESPONSE per activityType
    // ========================================================
    var EXTRA_RESP_TEMPLATES = {
    "4003": {
        "rank": [
            {
                "_id": "aaafa8f4-38fb-4474-aca2-8b07bb59b4bf",
                "_oriServerId": 398,
                "_nickName": "AgusToha",
                "_headImage": "hero_icon_1404",
                "_guildName": "System Clan1",
                "_headEffect": 0,
                "_headBox": 0,
                "_level": 63,
                "_vip": 2,
                "_rankValue": 56
            },
            {
                "_id": "35e1a004-8771-4a0d-97e4-a6d26a81a51a",
                "_oriServerId": 398,
                "_nickName": "zeb907",
                "_headImage": "hero_icon_1205",
                "_guildName": "Saiyans",
                "_headEffect": 0,
                "_headBox": 0,
                "_level": 56,
                "_vip": 8,
                "_rankValue": 53
            },
            {
                "_id": "f53d8b64-c6ec-4966-a768-23e4b79710dd",
                "_oriServerId": 398,
                "_nickName": "Haze",
                "_headImage": "hero_icon_1401",
                "_guildName": "System Clan1",
                "_headEffect": 0,
                "_headBox": 0,
                "_level": 61,
                "_vip": 4,
                "_rankValue": 50
            }
        ],
        "selfValue": 0,
        "selfRank": 0
    }
};

    // ========================================================
    // BRIEF DATA (fallback for unknown actIds)
    // ========================================================
    var BRIEF_DATA = {
    "1c19108c-b90b-4918-95fb-b401a799b414": { "templateName": "\u65b0\u670d\u7279\u60e0\u4e09\u9009\u4e00\u793c\u5305", "name": "Hero Value Pack", "icon": "/activity/\u65b0\u670d\u6d3b\u52a8/xinfuyingxiongtehui_rukou.png", "displayIndex": 0, "showRed": true, "actCycle": 2, "actType": 5037 },
    "97114e80-830c-4d63-bb72-fb3a30eb67e8": { "templateName": "\uff08\u5f00\u670d\uff09\u65b0\u670d\u7279\u60e0\u5305\uff08\u65b0\uff09", "name": "New Server Discount Pack", "icon": "/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew42.png", "displayIndex": 2, "showRed": true, "actCycle": 2, "actType": 2003 },
    "2c6125f1-c012-492d-9022-b8e3f29fbf25": { "templateName": "\uff08\u5f00\u670d\uff09\u4eca\u65e5\u7279\u4ef7\uff08\u65b0\uff09", "name": "Discount Today", "icon": "/activity/\u5f3a\u8005\u4e4b\u8def/huodongnew205.png", "displayIndex": 3, "showRed": true, "actCycle": 2, "actType": 5003 },
    "205e06d9-fcb2-43f1-929e-16b4f4de2fcb": { "templateName": "\uff08\u65b0\u7248\u5f00\u670d\uff09\u6bcf\u65e5\u7d2f\u5145", "name": "Daily accumulated top-up", "icon": "/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew35.png", "displayIndex": 6, "showRed": true, "actCycle": 2, "actType": 2007 },
    "5cd9f34d-18ac-445c-b782-5ced80f10c10": { "templateName": "\uff08\u5f00\u670d\uff09\u7d2f\u5145\u8c6a\u793c\uff08\u65b0\uff09", "name": "Cumulative Top-up Gift", "icon": "/activity/\u5f3a\u8005\u4e4b\u8def/huodongnew107.png", "displayIndex": 4, "showRed": true, "actCycle": 2, "actType": 2004 },
    "44bd872c-65aa-4253-8a00-94bdc172f49e": { "templateName": "\uff08\u5f00\u670d\uff09\u6210\u957f\u4efb\u52a1", "name": "Growth Quest", "icon": "/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew47.png", "displayIndex": 7, "showRed": true, "actCycle": 1, "actType": 1002 },
    "91275b4b-0505-4a46-989b-cae0bd1c6c76": { "templateName": "\uff08\u65b0\u7248\u5f00\u670d\uff09\u82f1\u96c4\u5927\u8fd4\u5229", "name": "Hero Grand Kickback", "icon": "/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew39.png", "displayIndex": 8, "showRed": true, "actCycle": 1, "actType": 2001 },
    "f764c7b8-137e-4537-9209-0e7e4febea58": { "templateName": "(\u65b0\u7248\u5f00\u670d)\u6a59\u5c06\u96c6\u7ed3\u53f7", "name": "Orange Hero Assembly", "icon": "/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew40.png", "displayIndex": 9, "showRed": true, "actCycle": 1, "actType": 2002 },
    "c53f9ca8-9262-4d97-9219-fd514fca1b5d": { "templateName": "\uff08\u65b0\u7248\u5f00\u670d\uff09\u62bd\u5361\u9001\u8c6a\u793c", "name": "Summon Return", "icon": "/activity/\u4e3b\u9898\u5361\u6d3b\u52a8/huodongnew234.png", "displayIndex": 10, "showRed": true, "actCycle": 2, "actType": 5005 },
    "5a093690-42d1-4acb-b3e5-9fc27a80fdd0": { "templateName": "\uff08\u65b0\u7248\u5f00\u670d\uff09\u70b9\u4eae\u56fe\u9274", "name": "Ignition Illustration", "icon": "/activity/\u62a2\u5360\u5148\u673a/huodongnew137.png", "displayIndex": 10, "showRed": true, "actCycle": 4, "actType": 4001 },
    "67b6ee00-3eb6-40f6-b2fb-dfbb29d6827d": { "templateName": "\uff08\u65b0\u7248\u5f00\u670d\uff09\u795e\u6bbf\u4e89\u5148", "name": "Temple Contest", "icon": "/activity/\u62a2\u5360\u5148\u673a/huodongnew142.png", "displayIndex": 9, "showRed": true, "actCycle": 4, "actType": 4003 },
    "3ad3406d-1c09-47f3-8ba5-86b0d5d90d93": { "templateName": "\uff08\u5f00\u670d\uff097\u65e5\u4efb\u610f\u5145", "name": "7-Day Top-up At Will", "icon": "/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew372.png", "displayIndex": 85, "showRed": true, "actCycle": 1, "actType": 1003 },
    "b56bde3a-2312-41a7-b920-a61f75e73f2e": { "templateName": "\u5f00\u670d\u4e03\u65e5\u767b\u9646\u6709\u793c", "name": "Event Sign-in", "icon": "/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew43.png", "displayIndex": 9999, "showRed": false, "actCycle": 8, "actType": 1001 }
};

    var UACT_STORAGE_KEY = 'dragonball_activity_uact';

    function loadUactStates() {
        try {
            var stored = localStorage.getItem(UACT_STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return {};
    }

    function saveUactStates(states) {
        try {
            localStorage.setItem(UACT_STORAGE_KEY, JSON.stringify(states));
        } catch (e) {}
    }

    function buildMinimalAct(actId, brief) {
        var now = Date.now();
        return {
            _id: actId,
            _templateId: "",
            _templateName: brief.templateName || "",
            _name: brief.name || "Unknown Activity",
            "__name": "",
            _des: "",
            "__des": "",
            _icon: brief.icon || "",
            _image: "",
            _displayIndex: brief.displayIndex || 0,
            _showRed: brief.showRed !== undefined ? brief.showRed : false,
            _activityType: brief.actType || 0,
            _cycleType: brief.actCycle || 1,
            _enable: true,
            _timeType: 2,
            _newUserUsing: true,
            _isloop: false,
            _loopInterval: 0,
            _startDay: 0,
            _durationDay: 7,
            _oldUserVip: 0,
            _oldUserServerOpenDay: 0,
            _oldUserServerOpenDayEnd: 0,
            _oldUserOfflineDay: 0,
            _startTime: 0,
            _endTime: now + (7 * 24 * 60 * 60 * 1000),
            _loopCount: 0,
            _loopTag: "",
            _timestamp: now,
            _hideos: "",
            _limitReward: { _items: {} },
            __ruleDes: null,
            _displayAdvance: 0,
            _displayExtend: 0
        };
    }

    function buildFreshUact(actId, act) {
        var activityType = act._activityType;
        var now = Date.now();
        var uact;

        if (UACT_TEMPLATES[activityType]) {
            uact = JSON.parse(JSON.stringify(UACT_TEMPLATES[activityType]));
        } else {
            uact = {
                _activityType: activityType,
                _startTime: now,
                _endTime: now + (7 * 24 * 60 * 60 * 1000),
                _activityId: actId,
                _loopTag: "",
                _haveClick: true,
                _gotRewards: { _items: {} }
            };
        }

        uact._activityId = actId;
        uact._startTime = now;
        uact._endTime = now + (7 * 24 * 60 * 60 * 1000);
        return uact;
    }

    function getOrCreateUact(actId, act) {
        var states = loadUactStates();
        if (states[actId]) {
            return states[actId];
        }
        var uact = buildFreshUact(actId, act);
        states[actId] = uact;
        saveUactStates(states);
        return uact;
    }

    function handleGetActivityDetail(request, playerData) {
        LOG.info('Handling activity.getActivityDetail');

        var actId = request.actId;
        var act;
        var uact;

        // 1. Look up activity data (3-tier fallback)
        if (KNOWN_ACTS[actId]) {
            // Full HAR data - deep copy to avoid mutation
            act = JSON.parse(JSON.stringify(KNOWN_ACTS[actId]));
            var mapInfo = ACT_TYPE_MAP[actId];
            LOG.info('HAR data: ' + act._name + ' (type=' + act._activityType + ', cycle=' + (mapInfo ? mapInfo.cycle : '?') + ')');
        } else if (BRIEF_DATA[actId]) {
            act = buildMinimalAct(actId, BRIEF_DATA[actId]);
            LOG.info('Brief fallback: ' + BRIEF_DATA[actId].name + ' (type=' + act._activityType + ')');
        } else {
            LOG.warn('Unknown actId: ' + actId + ' - creating minimal response');
            act = buildMinimalAct(actId, {
                name: 'Unknown Activity',
                templateName: '',
                icon: '',
                displayIndex: 0,
                showRed: false,
                actType: 0,
                actCycle: request.cycleType || 1
            });
        }

        // 2. Get or create uact
        uact = getOrCreateUact(actId, act);

        // 3. Build response (echo loop pattern)
        var responseData = {};
        for (var key in request) {
            responseData[key] = request[key];
        }
        responseData.act = act;
        responseData.uact = uact;
        responseData.forceEndTime = 0;

        // 4. Add type-specific extra fields (e.g., rank for Temple Contest)
        var activityType = act._activityType;
        if (EXTRA_RESP_TEMPLATES[activityType]) {
            var extra = JSON.parse(JSON.stringify(EXTRA_RESP_TEMPLATES[activityType]));
            for (var ek in extra) {
                responseData[ek] = extra[ek];
            }
        }

        // 5. certificationLevel (Hakim reads from response top-level)
        if (responseData.certificationLevel === undefined) {
            responseData.certificationLevel = 0;
        }

        LOG.success('getActivityDetail -> ' + (act._name || 'Unknown') +
            ' (type=' + activityType + ', cycle=' + (act._cycleType || request.cycleType) +
            ', uact_keys=' + Object.keys(uact).length + ')');

        return responseData;
    }

    function register() {
        if (typeof window === 'undefined') {
            console.error('[ACTIVITY] window not available');
            return;
        }
        window.MAIN_SERVER_HANDLERS = window.MAIN_SERVER_HANDLERS || {};
        window.MAIN_SERVER_HANDLERS['activity.getActivityDetail'] = handleGetActivityDetail;
        LOG.success('Handler registered: activity.getActivityDetail (12 HAR types + brief fallback)');
    }

    if (typeof window !== 'undefined') {
        register();
    } else {
        var _check = setInterval(function() {
            if (typeof window !== 'undefined') {
                clearInterval(_check);
                register();
            }
        }, 50);
        setTimeout(function() { clearInterval(_check); }, 10000);
    }

})(window);
