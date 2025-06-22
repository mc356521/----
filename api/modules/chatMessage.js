
import request from '@/utils/request';
import { getEnv } from '@/config/env';

const chatMessageApi = {
	
	getMyUnreadList(){
		return request({
			url:'/chatMessageCount/my-unread',
            method: 'GET'
		})
	},
	
	addUserUnread(toId){
		return request({
			url:'/chatMessageCount/increment-unread',
            method: 'POST',
			data:{
				chatType: 0,
				toId: toId
			  }
		})
	},
	
	clearUnread(fromId){
		return request({
			url:'/chatMessageCount/clear-unread',
		    method: 'POST',
			data:{
				chatType: 0,
				fromId: fromId
			  }
		})
	}
	
	
}

export default chatMessageApi;