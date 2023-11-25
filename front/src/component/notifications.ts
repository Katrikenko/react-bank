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


	return function saveNotification(type: string, message: string, token: string | null, userId?: string) {
		const getUsers = localStorage.getItem("users");
			const users = getUsers ? JSON.parse(getUsers) : null;


		let currentUserId = users.token || userId || authContext.state.token || "";
		
		const getNotification = localStorage.getItem(`notificationsList_${currentUserId}`); 
		if(getNotification) {
			const notifications: Notifications[] = JSON.parse(getNotification) || [];
			const newNotifications: Notifications = {
				id: notifications.length + 1,
				type: type,
				message: message, 
				time: new Date().toString(),
				userId: currentUserId,
			}

			console.log("Saving notification:", type, message, token, userId);
	
			const getUsers = localStorage.getItem("users");
			const users = getUsers ? JSON.parse(getUsers) : null;


			console.log("Current User ID:", currentUserId);
			console.log("New Notifications:", newNotifications);
			console.log("Token:", token);

			if(users) {
				const currentUser = users.find((user: User) => authContext.state.user &&
				user.email === authContext.state.user.email &&
				user.password === authContext.state.user.password)

				if(currentUser) {
					const token = currentUser.token;

					if(token) {
				newNotifications.token = token;
			}
				}
			}
			
	
			notifications.push(newNotifications);
			localStorage.setItem(`notificationsList_${currentUserId}`, JSON.stringify(notifications))
		} else {
			const newNotification: Notifications[] = [
				{
					id: 1,
					type: type,
					message: message,
					time: new Date().toString(),
					userId: currentUserId,
				  },
			]
	
			if(token) {
				if (newNotification.length > 0) {
					newNotification[0].token = token;
				  }
			}
	
			localStorage.setItem(`notificationsList_${currentUserId}`, JSON.stringify(newNotification))
		}
	}
}