import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  addDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { UserType } from "@/contexts/AuthContext";
import { JobType, CommentType, ReplyType } from "@/contexts/JobContext";
import { MessageType, ChatType } from "@/contexts/ChatContext";
import { initializeFirebaseData } from "./initializeFirebase";

export const ensureFirebaseInitialized = async () => {
  try {
    await initializeFirebaseData();
  } catch (error) {
    console.error("Failed to initialize Firebase data:", error);
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with name
    await updateProfile(user, { displayName: name });
    
    const timestamp = serverTimestamp();
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      name,
      email,
      photoURL: user.photoURL,
      bio: "",
      skills: [],
      role: "freelancer",
      joinedAt: timestamp
    });
    
    return {
      id: user.uid,
      name,
      email,
      photoURL: user.photoURL,
      bio: "",
      skills: [],
      role: "freelancer" as const
    };
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return {
        id: user.uid,
        ...userDoc.data()
      } as UserType;
    } else {
      throw new Error("User document does not exist");
    }
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamp to milliseconds if needed
      const joinedAt = data.joinedAt?.toMillis ? data.joinedAt.toMillis() : Date.now();
      return { 
        id: doc.id, 
        ...data, 
        joinedAt 
      };
    }) as UserType[];
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Convert Firestore timestamp to milliseconds
      const joinedAt = data.joinedAt?.toMillis ? data.joinedAt.toMillis() : Date.now();
      return { 
        id: userDoc.id, 
        ...data, 
        joinedAt 
      } as UserType;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const createJob = async (jobData: Omit<JobType, "id" | "timestamp" | "comments" | "likes">) => {
  try {
    const jobRef = collection(db, "jobs");
    const timestamp = serverTimestamp();
    
    const newJob = {
      ...jobData,
      timestamp,
      comments: [],
      likes: []
    };
    
    const docRef = await addDoc(jobRef, newJob);
    
    // Return a JobType with a number timestamp
    return { 
      id: docRef.id, 
      ...jobData,
      comments: [],
      likes: [],
      timestamp: Date.now() // Use current timestamp for immediate display
    };
  } catch (error) {
    throw error;
  }
};

export const getAllJobs = async () => {
  try {
    const jobsSnapshot = await getDocs(collection(db, "jobs"));
    return jobsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now(),
        comments: data.comments || [],
        likes: data.likes || []
      } as JobType;
    });
  } catch (error) {
    throw error;
  }
};

export const getJobById = async (jobId: string) => {
  try {
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (jobDoc.exists()) {
      const jobData = jobDoc.data();
      return { 
        id: jobDoc.id, 
        ...jobData,
        timestamp: jobData.timestamp?.toMillis ? jobData.timestamp.toMillis() : Date.now(),
        comments: jobData.comments || [],
        likes: jobData.likes || []
      } as JobType;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const addCommentToJob = async (jobId: string, content: string, user: UserType) => {
  try {
    const commentId = `comment_${Date.now()}`;
    const newComment: CommentType = {
      id: commentId,
      jobId,
      userId: user.id,
      userName: user.name,
      userPhoto: user.photoURL,
      content,
      timestamp: Date.now(),
      replies: []
    };
    
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      comments: arrayUnion(newComment)
    });
    
    return newComment;
  } catch (error) {
    throw error;
  }
};

export const addReplyToComment = async (jobId: string, commentId: string, content: string, user: UserType) => {
  try {
    // First get the job to find the comment
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (!jobDoc.exists()) throw new Error("Job not found");
    
    const jobData = jobDoc.data();
    const comments = jobData.comments || [];
    
    // Find the comment and add the reply
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const newReply: ReplyType = {
          id: `reply_${Date.now()}`,
          commentId,
          userId: user.id,
          userName: user.name,
          userPhoto: user.photoURL,
          content,
          timestamp: Date.now()
        };
        
        return {
          ...comment,
          replies: [...comment.replies, newReply]
        };
      }
      return comment;
    });
    
    // Update the job with the new comments array
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, { comments: updatedComments });
    
    return updatedComments.find(c => c.id === commentId)?.replies.slice(-1)[0];
  } catch (error) {
    throw error;
  }
};

export const toggleJobLike = async (jobId: string, userId: string) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) throw new Error("Job not found");
    
    const likes = jobDoc.data().likes || [];
    const userLiked = likes.includes(userId);
    
    await updateDoc(jobRef, {
      likes: userLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
    
    return !userLiked;
  } catch (error) {
    throw error;
  }
};

export const toggleSavedJob = async (userId: string, jobId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) throw new Error("User not found");
    
    const savedJobs = userDoc.data().savedJobs || [];
    const isJobSaved = savedJobs.includes(jobId);
    
    await updateDoc(userRef, {
      savedJobs: isJobSaved ? arrayRemove(jobId) : arrayUnion(jobId)
    });
    
    return !isJobSaved;
  } catch (error) {
    throw error;
  }
};

export const getSavedJobs = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) throw new Error("User not found");
    
    const savedJobIds = userDoc.data().savedJobs || [];
    
    // If there are no saved jobs, return empty array
    if (savedJobIds.length === 0) return [];
    
    // Otherwise get all the saved jobs
    const jobs: JobType[] = [];
    for (const jobId of savedJobIds) {
      const jobDoc = await getDoc(doc(db, "jobs", jobId));
      if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        jobs.push({
          id: jobDoc.id,
          ...jobData,
          timestamp: jobData.timestamp?.toMillis() || Date.now()
        } as JobType);
      }
    }
    
    return jobs;
  } catch (error) {
    throw error;
  }
};

export const getChats = async (userId: string) => {
  try {
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId)
    );
    
    const chatsSnapshot = await getDocs(chatsQuery);
    const chats = await Promise.all(chatsSnapshot.docs.map(async (chatDoc) => {
      const chatData = chatDoc.data();
      
      // Get the last message
      let lastMessage = null;
      if (chatData.messages && chatData.messages.length > 0) {
        lastMessage = chatData.messages[chatData.messages.length - 1];
      }
      
      return {
        id: chatDoc.id,
        name: chatData.name || "",
        participants: chatData.participants || [],
        messages: chatData.messages || [],
        isGroup: chatData.isGroup || false,
        lastMessage
      } as ChatType;
    }));
    
    return chats;
  } catch (error) {
    throw error;
  }
};

export const createChat = async (participantIds: string[], name = "") => {
  try {
    const isGroup = participantIds.length > 2 || !!name;
    
    const chatRef = collection(db, "chats");
    const newChat: Omit<ChatType, "id"> = {
      name,
      participants: participantIds,
      messages: [],
      isGroup
    };
    
    const docRef = await addDoc(chatRef, newChat);
    return { id: docRef.id, ...newChat } as ChatType;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (chatId: string, senderId: string, content: string) => {
  try {
    const chatRef = doc(db, "chats", chatId);
    
    const newMessage: MessageType = {
      id: `msg_${Date.now()}`,
      senderId,
      content,
      timestamp: Date.now()
    };
    
    await updateDoc(chatRef, {
      messages: arrayUnion(newMessage)
    });
    
    return newMessage;
  } catch (error) {
    throw error;
  }
};

export const getJobCategories = async () => {
  try {
    await ensureFirebaseInitialized();
    
    const categoriesDoc = await getDoc(doc(db, "metadata", "jobCategories"));
    if (categoriesDoc.exists()) {
      return categoriesDoc.data().categories || [];
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const getSkillsList = async () => {
  try {
    await ensureFirebaseInitialized();
    
    const skillsDoc = await getDoc(doc(db, "metadata", "skills"));
    if (skillsDoc.exists()) {
      return skillsDoc.data().skills || [];
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const uploadUserPhoto = async (userId: string, file: File) => {
  try {
    const storageRef = ref(storage, `users/${userId}/profile`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with photo URL
    await updateDoc(doc(db, "users", userId), {
      photoURL: downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export { initializeFirebaseData };
