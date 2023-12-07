import {  useContext } from "react";
import { AuthContext, User } from "../App";

export interface Notifications {
	id: number;
	type: string;
	message: string;
	time: string;
	token?: string;
	userId?: string;
}

export function useSaveNotification() {
	const authContext = useContext(AuthContext)!;

	return async function saveNotification(type: string, message: string, userId?: string) {

		const token = authContext.state.token || "";
		
		try {
			const res = await fetch(
				"http://localhost:4000/getNotifications",
				{
				  method: "POST",
				  headers: {
					"Content-Type": "application/json",
				  },
				  body: JSON.stringify({
					token,
					type,
					message, }),
			})

		if(res.ok) {
			const data = await res.json()
			const notifications: Notifications[] = Array.isArray(data) ? data : [];
			const newNotifications: Notifications = {
				id: notifications.length + 1,
				type: type,
				message: message, 
				time: new Date().toString(),
				userId: token,
			}

			if(token) {
				newNotifications.token = token;
			}




			notifications.push(newNotifications);

			localStorage.setItem(`notificationsList_${token}`, JSON.stringify(notifications))
		} else {
			const newNotification: Notifications[] = [
				{
					id: 1,
					type: type,
					message: message,
					time: new Date().toString(),
					userId: token,
				  },
			]
	
			if(token) {
				if (newNotification.length > 0) {
					newNotification[0].token = token;
				  }
			}
	
			localStorage.setItem(`notificationsList_${token}`, JSON.stringify(newNotification))
		}
		} catch(err) {
			console.error(err)
		}
	}

}