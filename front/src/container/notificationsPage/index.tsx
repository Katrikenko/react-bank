import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../App";
import "./index.css";
import { Notifications } from "../../component/notifications";

import Back from "../../component/back-button";

interface NotificationsState {
  id: number;
  message: string;
  type: NotificationsType;
  time: string;
}

enum NotificationsType {
  ANNOUNCEMENT = "Announcement",
  WARNING = "Warning",
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationsState[]>([]);

  const [type, setType] = useState<NotificationsType>(
    NotificationsType.ANNOUNCEMENT
  );
  const [message, setMessage] = useState<string>("");

  const authContext = useContext(AuthContext);

  function timeSince(date: Date) {
    let seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }

  useEffect(() => {
    // const alertNotifications: NotificationsState[] = [
    //   {
    //     id: 1,
    //     type: NotificationsType.ANNOUNCEMENT || NotificationsType.WARNING,
    //     message: AlertType.REPLENISHMENT,
    //     time: new Date().toString(),
    //   },
    //   {
    //     id: 2,
    //     type: NotificationsType.WARNING,
    //     message: AlertType.LOGIN,
    //     time: new Date().toString(),
    //   },
    // ];

    // setNotifications(alertNotifications);

    const getNotificationsList = async () => {
      try {
        const token = authContext.state.token;

        const res = await fetch("http://localhost:4000/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.userNotifications) {
            const notificationsArray = data.userNotifications;

            setNotifications(notificationsArray);
          } else {
            console.error("No notifications data found");
          }
        } else {
          console.error("Failed to get notifications");
        }
      } catch (err) {
        console.error(err);
      }
    };

    getNotificationsList();
  }, [authContext.state.token, setNotifications]);

  return (
    <div className="page darker-page">
      <header className="header header-center">
        <Back />
        <h1 className="title-dark">Notifications</h1>
      </header>
      <main className="notifications__section">
        {notifications.reverse().map((notification) => {
          return (
            <div
              key={notification.id + Math.random().toString(16).slice(2)}
              className="notification__card">
              <img
                src={
                  notification.type === NotificationsType.ANNOUNCEMENT
                    ? "./svg/bell-notification.svg"
                    : "./svg/danger-notification.svg"
                }
                className="card-img"
                alt="profile"
              />
              <div className="card-content">
                <p className="card__title">{notification.message}</p>
                <div className="card-subtitle">
                  <span>{timeSince(new Date(notification.time))} ago</span>
                  <img src="./svg/dot.svg" alt="ellipse" />
                  <span>{notification.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default NotificationsPage;
