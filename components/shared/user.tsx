import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { IUser } from "@/types";
import { sliceText } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "../ui/button";
import axios from "axios";

interface Props {
  user: IUser;
  onChangeFollowing?: (user: IUser[]) => void;
  isFollow?: boolean;
  following?: IUser[];
}

const User = ({ user, onChangeFollowing, isFollow, following }: Props) => {
  const { data: session }: any = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [stateUser, setStateUser] = useState<IUser>(user);
  const router = useRouter();

  const onFollow = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    try {
      setIsLoading(true);
      await axios.put("/api/follows", {
        userId: user._id,
        currentUserId: session.currentUser._id,
      });
      setStateUser((prevUser) => ({
        ...prevUser,
        followers: [...prevUser.followers, session.currentUser._id],
      }));

      router.refresh();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const onUnfollow = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    try {
      setIsLoading(true);
      await axios.delete("/api/follows", {
        data: { userId: user._id, currentUserId: session.currentUser._id },
      });
      setStateUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter(
          (c) => c !== session.currentUser._id
        ),
      }));

      router.refresh();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const goToProfile = (evt: any) => {
    evt.stopPropagation();
    router.push(`/profile/${user._id}`);
  };

  return (
    <div
      onClick={goToProfile}
      className="flex gap-3 items-center justify-between cursor-pointer hover:bg-slate-300 hover:bg-opacity-10 transition py-2 px-3 rounded-md"
    >
      <div className="flex gap-2 cursor-pointer">
        <Avatar>
          <AvatarImage src={user.profileImage} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <p className="text-white font-semibold text-sm line-clamp-1">
            {user.name}
          </p>
          <p className="text-neutral-400 text-sm line-clamp-1">
            {user.username
              ? `@${sliceText(user.username, 16)}`
              : sliceText(user.email, 16)}
          </p>
        </div>
      </div>

      {isFollow && user._id !== session?.currentUser?._id ? (
        stateUser.followers.includes(session?.currentUser?._id) ? (
          <Button
            label={"Unfollow"}
            outline
            onClick={onUnfollow}
            disabled={isLoading}
          />
        ) : (
          <Button
            label={"Following"}
            onClick={onFollow}
            disabled={isLoading}
          />
        )
      ) : null}
    </div>
  );
};

export default User;
