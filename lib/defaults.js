// Used until content is added in the CMS (/studio).
// Once the CMS has posters, the site shows those instead of these.

export const DEFAULT_SETTINGS = {
  headline: 'Flyers with impact. Designed to be seen.',
  subline: 'Graphic design by Kelvin Mensah: church flyers, birthday flyers, social media posts and banners.',
  buttonText: 'See my work',
  statement: 'I design flyers that get people in the room.',
  statementSoft: 'Church services, birthdays, events and everything in between.',
  aboutTitle: 'Designer by craft. Developer by degree.',
  aboutText:
    "I'm Kelvin Mensah, a graphic designer in Auckland, New Zealand. Most of my work is flyers and posters for church programmes, birthdays and social media.\n\nI also studied Computer Science at the University of Auckland, so I build websites too, including this one.",
  location: 'Auckland, New Zealand',
  education: 'Computer Science, University of Auckland',
  contactHeading: "Let's make your next flyer.",
  telegramName: 'Creative Cloud',
  telegramUrl: '',
  fiverrUrl: '',
  youtubeUrl: 'https://www.youtube.com/@kelvstudio_',
  youtubeChannelId: 'UC4SUmWWruH5f9lFzBuIohnw', // Kelv Studio
  featuredVideoUrl: '',
  featuredVideoTitle: '',
};

// width ÷ height of the starter poster files in /public/posters
const ASPECT = {1:.747,2:.703,3:.567,4:.566,5:.565,6:.606,7:.801,8:.564,9:.563,10:.754,11:1.783,12:1.770,13:1.773,14:.551,15:.563,16:.749,17:.805,18:.560,19:.804,20:1.616};
const SORT = {
  birthday: [7, 17],
  parents: [2],
  international: [3, 4, 5],
  social: [14, 15, 1, 6, 8, 9, 10, 16, 18, 19],
  banners: [11, 12, 13, 20],
};

// tiny blurred previews, shown instantly while the real image loads
const LQIP = {"1": "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAAAQBACdASoPABQAPu1iqU2ppaOiMAgBMB2JaACw7CP4diBi3lWczhJPQAD+mxd8mFnXzqDZkkA0qC3FJeR20Jh5PT24ra4uolhCo7+ciegPJMA/zPnbqFcOO9PTn9eNrYGAqCKY/MyTq7q8HsRGfpQXJuTsjoAA", "2": "data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAAAQBACdASoOABQAPu1iqU2ppaOiMAgBMB2JbACdAYwctFw4IfwRxB5XkADiLLCPzNWO6H/NCHqHGoEAalMvL8IN47/WPb3B3lWffWAEnFKrO9iEGnncOIznE3NEPN0wSp/MG4oeX9xTdJgCLPIkllu0Fraio4AUo+ktO67dLtZ4rEodQIBUApAdHZsp4YPGcCAtx8AhgAA=", "3": "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAADwAwCdASoLABQAPu1iqU2ppaOiMAgBMB2JbACdACICqLPm3B3CiQMAAP6JRb/w44fb5AMigQ1Y24gkGpLUweKHdy+uZurnFCVYEtBKSACnyR5Yi07YW3Dadm1ZcW7AzHCypR2gBWg2J+UhRmvnJ3QK1RR0a+gt7snwitS1R1c16WOZSZHLgJi750PUxMlB4AA=", "4": "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAAAQBACdASoLABQAPu1iqU2ppaQiMAgBMB2JQBXDhC1A/PEzGIkAQLTSgAD+hBYJ3vWtKX1GCEDyCgqRE0Huf9aJv1+NMaCvXqHhyWYjm84Bgs18FdpFe4/v+w4WHt5X/Fn2K/JhV3uqAMgxG4EGxbLgAAA=", "5": "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAAAQBACdASoLABQAPu1iqU2ppaOiMAgBMB2JZACdIExDAs5GFjokOEwzQADgLuxGyjiTQTcf/TjLsTZpcBYpGjG/mSaZuKWHfshT1HqVBJyH4pfxcWiB+3eLMybdGWQBNfxcgiThSD7zLD1OQYfL7WLyxNG/VJ9AyxAwAAAA", "6": "data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAABQBACdASoMABQAPu1iqU2ppaOiMAgBMB2JZACdMoFWAAQqRapzKPyLh/IAAP6YVK2T4gDOFYWTqD56IMuGLkzYMlb64TyzCqcHCw4tSm+5bLaoAz1LJuZAStwT9LSdTA5eGHuC+g2JGYaS1Jp6uxypAANKG5occoX93hwArz70LnJLVIOmJZbrLkg+mLLUxtHAAA==", "7": "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAABwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdMoMYAElVbzTiCn+LzvvjYAD+6GaBNG/G3PmXokOTmYpPl5A0CCXmrAcm3DVZr++CtQghT87dADdYtzBSiY1JYKlckfoUFfRS7qE392/SbJPjhAY4Ee2sBvDgKOCk5GweLu6muLp2KKIGAAAA", "8": "data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAAAQBACdASoLABQAPu1iqU2ppaOiMAgBMB2JZACdACFwyxsC1ymBXlE0AAD+xuTWoJbZq/LUowDHaq+o73hdxRGq3XelCQy5pMBMTo3/BWFzFgIjv7EXwW+OPZAwwyJa9Jv/eR7uzaFlxdQW3FS1hlyc2AgW/Lwd6An76+AgWAAAAA==", "9": "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAADQAwCdASoLABQAPu1iqU2ppaOiMAgBMB2JZwAAXh9VPuSos5hYP+AA/uhNfhkYZs6Qt2YqJbM7PkiT0N8A45898JJqovxDLoDYm26keWCp3C4h7L8feGEuLDIkmjUOs9yviyqClxgtFzbMdqsmZOS8AyJ1YE+saT9VwAAA", "10": "data:image/webp;base64,UklGRq4AAABXRUJQVlA4IKIAAAAwBACdASoPABQAPu1iqU2ppaOiMAgBMB2JbACdACLWvZbXN9fZxOtsEeAA/tl92YhHP0j+kGwM/gUGPMXrFeVYZWEPTTcj741tR+DNSKz6d56BGUK8Ngp1dKFzsUrNkOniL2C9zxw0fh1vKLtGZPG53Ngzn71GBpyBdfXmFTfIAB48ltMWwvYShbZUzSR1el0Vp3ny/CoGs/DGcT7rzlQ8gAA=", "11": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACwAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JZwC7ABl6wfvOPXqsAAD+w9yfT3sEC0Kc1H0bWYyG2Ms1I7Mxt/BR2CdWaFuNW0WnxV0cKwm6gAAA", "12": "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADQAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JYwCdABTHm+3BSpIQ6AAA/iV/8rVAxakMALMmi/pTxe50SNoWiNDaCpSC2tzUMC+pFw+pMANZP5ektEcqRU8oPy0cc9xTQAA=", "13": "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAACwAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JYgCdABo2za/nY/9kYAD+5SKE9fDx8wSfbhFvX+gZDBYoBzk7HT3s0ENcdT9OAdteFFB7ishg9NRvJxFRFvuadJwRkJBbUfMczbFfPF+VCyeoxCUYZkAA", "14": "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAABQBACdASoLABQAPu1iqU2ppaQiMAgBMB2JZgC/cUAA6PJBEi0MjZjhGbDwAP7R3/GZcQ2QPOqJiMnl6Itipzf8Yd4wSEcdnnMHnqEQi0VvsbXwpUPGosBtF8+sRIf0b6MU6tM/kUcBOny9vjG5J00nCmODdKbYX43bdaNO7DxwQ4CvPxBPAAAA", "15": "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAABwBACdASoLABQAPu1iqU2ppaOiMAgBMB2JbACdMoMYAEn89xn/jjK5zOqVAADiZHtLyQ6evWxtcxBgM9U/zt7W6kHThm0tljSRWqv5ghKwXBl33xPIiY7iFHz9tjfPJQAcOYHRK4QaTfaePZ4bfbjMtaCtA+onlwoq/eiqHlFTMAAA", "16": "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAADQAwCdASoPABQAPu1iqU2ppaOiMAgBMB2JbACdMoAC7zU+W6ebX8AA/pEro3YzCci4Ufd1L4Ajy1AXRXV5uQPJ7Jlh9AO9w6X0+NsrzVaxb0RoGcw9XjnyfZ30m2qsL0z2awyZ6Fm9+qdZsz7++Yuutyjs0VEU/ULBX6VBWVTkRmRmlR1/vYpwAAA=", "17": "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAACwAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JbAC7AA9RM7r948RcYAD7YsAU6R8VN5B/RAjdzGgsHV8N4AEtzeEblXCm+13PKMM55H+kPpL5sWEshr/j84vZzs2oH7Jj90LdxgbvQDD7GGvqQLlbDsppU1/sMJAi6SQAAA==", "18": "data:image/webp;base64,UklGRpgAAABXRUJQVlA4IIwAAACwAwCdASoLABQAPu1iqU2ppaQiMAgBMB2JbACsABSmJQv+taNAwAD+2o0UBgtNzfUrxKb5a64+t7FXFrQkF6iABHkzDfJAqDm8dnkAY8nTcegRNCA9k+vWL6JZlhuKhFIc8YeodJCe6OOGQkRiA4Xq6ctwwy8gnWonUzuKOKBy642+u0Vh98a+WgAAAA==", "19": "data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAACQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZAC2yCIhMtaR7q0QEck+/avO0gAA/tFwczQ4VtlK84lOfWKCyre9nGRgSDicQBX1G/8yYsKyIvunQgEa7mOfU9O+TcMoDhIWUyl1WVizhpizwCSyvE6PLgd6UgAwHTpmoGyy1NoxyIJ1rbA9WQtWWKHeH4fEoRZ7Xw3kWLS8/vTSZybVR09XrTzOm4rvGH78fAAA", "20": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADQAwCdASoUAAwAPu1iqU2ppaQiMAgBMB2JYgCdACGKvHgVMMzCvzAA/qLybqGdC7GtG0sNyNHHtR8QlEn/6tkwK8ATabLPTcZHvvXHjV2MqIaw10ouiCJ+yiMCJJ5DVgpvSMAA"};

export const LOCAL_POSTERS = Object.entries(SORT).flatMap(([section, nums]) =>
  nums.map((n) => ({
    id: `local-${n}`, title: `Design ${n}`, section, aspect: ASPECT[n], lqip: LQIP[n],
    url: `/posters/${n}.webp`,          // full size (viewer, first design)
    thumb: `/posters/thumb/${n}.webp`,  // small size (wall tiles, work grid)
  }))
);
export const LOCAL_START = LOCAL_POSTERS.find((p) => p.id === 'local-13');
