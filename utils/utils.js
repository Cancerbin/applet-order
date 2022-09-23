export default {
	// 同步明细数量
	onSyncNumber(array) {
		const cacheList = uni.getStorageSync('cacheList') || [];
		array.forEach(item => {
			const index = cacheList.findIndex(row => row.itemNo === item.itemNo);
			item.itemQty = 0;
			if (index >= 0) {
				item.itemQty = cacheList[index].itemQty;
			}
		})
		return array;
	},
	// 增加数量
	onPlusNumber(record) {
		const factor = record.itemQty ? parseFloat(record.orderChangeAmt || 1) : parseFloat(record.minOrderAmt || 1);
		const number = record.itemQty + factor;
		return new Promise((resolve, reject) => {
			if (number <= parseFloat(record.inventoryQuantity)) {
				if ((record.maxOrderAmt && number <= parseFloat(record.maxOrderAmt)) || !record.maxOrderAmt) {
					resolve(number);
				} else {
					uni.showModal({
						title: '提示',
						content: '采购数量不能超过限购数量',
						showCancel: false
					});
					reject()
				}
			} else {
				uni.showModal({
					title: '提示',
					content: '库存数量不足',
					showCancel: false
				});
				reject();
			}
		})
	},
	// 减少数量
	onReduceNumber(record) {
		const factor = record.itemQty > parseFloat(record.minOrderAmt || 1) ? parseFloat(record.orderChangeAmt || 1) :
			parseFloat(record.minOrderAmt || 1);
		const number = record.itemQty - factor;
		return new Promise((resolve, reject) => {
			if (number) {
				resolve(number);
			} else {
				uni.showModal({
					title: '提示',
					content: '是否确定删除所选商品？',
					success: (res) => {
						if (res.confirm) {
							resolve(0)
						} else {
							reject();
						}
					}
				});
			}
		})
	},
	// 更新数量
	onUpdateNumber(record, number) {
		// 判断是否需要计算
		const isCalcFlag = number > parseFloat(record.minOrderAmt || 1);
		const calcValue = number > parseFloat(record.minOrderAmt || 1) ?
			(number - parseFloat(record.minOrderAmt || 1)) :
			(number ? parseFloat(record.minOrderAmt || 1) : 0);
		let realityValue = calcValue;
		if (isCalcFlag) {
			realityValue = parseFloat(record.minOrderAmt || 1) + (Math.ceil(calcValue / parseFloat(record
				.orderChangeAmt || 1)) * parseFloat(record.orderChangeAmt || 1))
		}
		return new Promise((resolve, reject) => {
			if (realityValue <= parseFloat(record.inventoryQuantity)) {
				if ((record.maxOrderAmt && realityValue <= parseFloat(record.maxOrderAmt)) || !record
					.maxOrderAmt) {
					if (realityValue) {
						resolve(realityValue);
					} else {
						uni.showModal({
							title: '提示',
							content: '是否确定删除所选商品？',
							success: (res) => {
								if (res.confirm) {
									resolve(0)
								} else {
									reject();
								}
							}
						});
					}
				} else {
					uni.showModal({
						title: '提示',
						content: '采购数量不能超过限购数量',
						showCancel: false
					});
					reject()
				}
			} else {
				uni.showModal({
					title: '提示',
					content: '库存数量不足',
					showCancel: false
				});
				reject();
			}
		})
	},
	// 更新商品缓存
	updateCache(record, number) {
		const cacheList = uni.getStorageSync('cacheList') || [];
		const index = cacheList.findIndex(item => item.itemNo === record.itemNo);
		if (index >= 0) {
			if (number) {
				cacheList[index].itemQty = number;
			} else {
				cacheList.splice(index, 1);
			}
		} else {
			if (number) {
				cacheList.push({
					...record,
					itemQty: number,
					checked: true
				});
			}
		}
		uni.setStorageSync('cacheList', cacheList);
		this.updateCart();
	},
	// 更新购物车
	updateCart() {
		const cacheList = uni.getStorageSync('cacheList') || [];
		const tabIndex = 2;
		let count = 0;
		cacheList.forEach(item => {
			count += item.itemQty;
		})
		if (count) {
			uni.setTabBarBadge({
				index: tabIndex,
				text: `${count}`
			})
		} else {
			uni.removeTabBarBadge({
				index: tabIndex
			})
		}
	},
	// 格式化促销活动
	formatPromotionActivity(record) {
		let text = '';
		if (record.promotionItemVO) {
			const dictionary = {
				'10': '秒杀',
				'20': '特价',
				'30': '团购'
			}
			text = dictionary[record.promotionItemVO.promotionType];
		} else {
			const dictionary = {
				'40': '满减',
				'50': '满赠'
			}
			text = dictionary[record.giftAndReduceVO.promotionType.substr(0, 2)];
		}
		return text;
	},
	// 格式化促销类型
	formatPromotionType(record) {
		const {
			price,
			promotionType
		} = record;
		const dictionary = {
			'10': '秒杀',
			'20': '特价',
			'30': '团购',
			'40': '满减',
			'50': '满赠',
			'100': '积分兑换'
		}
		return parseFloat(price) === 0 && promotionType === '50' ? '赠品' : dictionary[promotionType];
	},
	// 格式化图片
	formatPicture(value) {
		let url = '/static/commodity/empty.png';
		if (value && value !== "null" && value !== "[]") {
			if (value.indexOf("[") >= 0) {
				url = JSON.parse(value)[0];
			} else {
				url = value;
			}
		}
		return url;
	},
	// 格式化金额
	formatValue: (value, type) => {
		const cypherType = type || 'amount';
		let number = 0;
		switch (cypherType) {
			case 'amount':
				number = 2;
				break;

			case 'quantity':
				number = 3;
				break;

			default:
				break;
		}
		const factor = Math.pow(10, number); // 进位因子
		const dividend = Math.pow(10, 0 - number); // 退位因子
		const cypherValue = isNaN(value) ? 0 : (value * factor);
		return (cypherValue.toFixed() * dividend).toFixed(number);
	},
	// 退出登录
	logout: () => {
		// 清除缓存
		uni.removeStorageSync('token');
		uni.removeStorageSync('openid');
		uni.removeStorageSync('code');
		uni.removeStorageSync('tenant');
		uni.reLaunch({
			url: '/pages/login/index'
		})
	}
}
