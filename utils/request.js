export const request = (options) => {
	const baseUrl = "https://test-passport.dbs12580.com";
	// const baseUrl = "https://saas.dbs12580.com";
	// const baseUrl = "http://192.168.101.121:8760";
	const {
		type = 'GET', // 默认为GET请求
		url,
		data = {},
		intercept = true, // 是否截取错误进行提示
	} = options;
	const header = {
		'content-type': 'application/json',
		'Authorization': 'Basic ZGJzX3dlYjpkYnNfd2ViX3NlY3JldA=='
	}
	const token = uni.getStorageSync("token");
	const tenant = uni.getStorageSync("tenant");
	if (token) {
		header.token = "Bearer " + token;
	}
	if (tenant) {
		header.tenant = tenant;
	}

	return new Promise((resolve, reject) => {
		return uni.request({
			url: baseUrl + url,
			method: type,
			data: data,
			dataType: 'JSON',
			header: header,
			timeout: 40000,
			success: res => {
				if (res.statusCode === 200) {
					const result = JSON.parse(res.data);
					if (intercept) {
						if (result.code === 0) {
							return resolve(result);
						} else {
							uni.hideLoading();
							uni.stopPullDownRefresh();
							uni.showModal({
								title: '提示',
								content: result.msg,
								showCancel: false
							});
							return resolve(result);
						}
					} else {
						return resolve(result);
					}
				} else if (res.statusCode === 401) {
					uni.hideLoading();
					uni.showModal({
						title: '提示',
						content: '用户登录超时，请重新登录',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								uni.removeStorageSync('token');
								uni.removeStorageSync('openid');
								uni.removeStorageSync('code');
								uni.removeStorageSync('tenant');
								uni.reLaunch({
									url: '/pages/login/index'
								})
							}
						}
					});
				}
			},
			fail: error => {
				uni.hideLoading();
				uni.showToast({
					icon: 'error',
					title: '网络信号差',
					mask: true,
					duration: 2000
				});
				return reject(error);
			}
		})
	})
}

export default request;
