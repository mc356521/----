
import request from '@/utils/request';
import { getEnv } from '@/config/env';

const chatMessageApi = {
	
	getMyUnreadList(){
		return request({
			url:'/chatMessageCount/my-unread',
            method: 'GET'
		})
	},
	
	addUserUnread(data){
		return request({
			url:'/chatMessageCount/increment-unread',
            method: 'POST',
			data:{
				chatType: 0,
				toId: data.toId,
				lastMessageContent:data.content
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