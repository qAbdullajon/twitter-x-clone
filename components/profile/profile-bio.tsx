"use client";

import { IUser } from "@/types";
import React, { useState } from "react";
import Button from "../ui/button";
import { IoLocationSharp } from "react-icons/io5";
import { BiCalendar } from "react-icons/bi";
import { formatDistanceToNowStrict } from "date-fns";
import axios from "axios";
import { useRouter } from "next/navigation";
import EditModal from "../modals/edit-modal";
import useEditModal from "@/hooks/useEditeModal";
import Modal from "../ui/modal";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import User from "../shared/user";

const ProfileBio = ({ user, userId }: { user: IUser; userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState<IUser[]>([]);
  const [followers, setFollowers] = useState<IUser[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [state, setState] = useState<"following" | "followers">("following");

  const editModal = useEditModal();
  const router = useRouter();

  const onFollow = async () => {
    try {
      setIsLoading(true);
      await axios.put("/api/follows", {
        userId: user._id,
        currentUserId: userId,
      });
      router.refresh();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const onUnfollow = async () => {
    try {
      setIsLoading(true);
      await axios.delete("/api/follows", {
        data: { userId: user._id, currentUserId: userId },
      });
      router.refresh();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getFollowUser = async (userId: string, type: string) => {
    try {
      setIsFetching(true);
      const { data } = await axios.get(
        `/api/follows?state=${type}&userId=${userId}`
      );
      setIsFetching(false);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const openFollowModal = async () => {
    try {
      setOpen(true);
      const data = await getFollowUser(user._id, "following");
      setFollowing(data);
    } catch (error) {
      console.log(error);
    }
  };

  const onFollowing = async () => {
    setState("following");
    if (following.length === 0) {
      const data = await getFollowUser(user._id, "following");
      setFollowing(data);
    }
  };
  const onFollowers = async () => {
    setState("followers");
    if (followers.length === 0) {
      const data = await getFollowUser(user._id, "followers");
      setFollowers(data);
    }
  };

  const onChangeFollowing = async (data: IUser[]) => {};
  return (
    <>
      <EditModal user={user} />
      <div className="border-b-[1px] border-neutral-800 pb-4">
        <div className="flex justify-end p-2">
          {userId === user._id ? (
            <Button
              label={"Edit profile"}
              onClick={editModal.onOpen}
              secondary
            />
          ) : user.isFollowing ? (
            <Button
              label={"Unfollow"}
              outline
              onClick={onUnfollow}
              disabled={isLoading}
            />
          ) : (
            <Button label={"Follow"} onClick={onFollow} disabled={isLoading} />
          )}
        </div>

        <div className="mt-8 px-4">
          <div className="flex flex-col">
            <p className="text-white text-2xl font-semibold">{user.name}</p>
          </div>

          <p className="text-md text-neutral-500">
            {user.username ? `@${user.username}` : user.email}
          </p>

          <div className="flex flex-col mt-4">
            <p className="text-white">{user.bio}</p>
            <div className="flex gap-4 items-center">
              {user.location && (
                <div className="flex flex-row items-center gap-2 mt-4 text-sky-500">
                  <IoLocationSharp size={24} />
                  <p>{user.location}</p>
                </div>
              )}
              <div className="flex flex-row items-center gap-2 mt-4 text-neutral-500">
                <BiCalendar size={24} />
                <p>
                  Joined {formatDistanceToNowStrict(new Date(user.createdAt))}{" "}
                  ago
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center mt-6 gap-6">
              <div
                className="flex flex-row items-center gap-1 hover:underline cursor-pointer"
                onClick={openFollowModal}
              >
                <p className="text-white">{user.following}</p>
                <p className="text-neutral-500">Following</p>
              </div>

              <div
                className="flex flex-row items-center gap-1 hover:underline cursor-pointer"
                onClick={openFollowModal}
              >
                <p className="text-white">{user.followers}</p>
                <p className="text-neutral-500">Followers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOLLOING AND FOLLOWERS MODAL */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        body={
          <>
            <div className="flex flex-row w-full py-3 px-4">
              <div
                className={cn(
                  "w-1/2 h-full flex justify-center items-center cursor-pointer font-semibold",
                  state === "following" &&
                    "border-b-2 border-sky-500 text-sky-500"
                )}
                onClick={onFollowing}
              >
                Folowing
              </div>
              <div
                className={cn(
                  "w-1/2 h-full flex justify-center items-center cursor-pointer font-semibold",
                  state === "followers" &&
                    "border-b-2 border-sky-500 text-sky-500"
                )}
                onClick={onFollowers}
              >
                Folowers
              </div>
            </div>
            {isFetching ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="animate-spin text-sky-500" />
              </div>
            ) : (
              <div>
                {state === "following" ? (
                  following.length === 0 ? (
                    <div className="text-neutral-600 text-center p-6 text-xl">
                      No Following
                    </div>
                  ) : (
                    following.map((user) => (
                      <User user={user} key={user._id} isFollow following={followers} onChangeFollowing={onChangeFollowing} />
                    ))
                  )
                ) : followers.length === 0 ? (
                  <div className="text-neutral-600 text-center p-6 text-xl">
                    No Followers
                  </div>
                ) : (
                  followers.map((user) => (
                    <User user={user} key={user._id} isFollow following={following} onChangeFollowing={onChangeFollowing} />
                  ))
                )}
              </div>
            )}
          </>
        }
      />
    </>
  );
};

export default ProfileBio;
