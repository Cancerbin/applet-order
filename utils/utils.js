export default {
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
