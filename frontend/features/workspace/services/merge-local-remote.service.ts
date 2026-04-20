import { useRemoteNotes } from "../hooks/useRemoteNotes";

export const mergeLocalRemoteService = {
    fetchRemoteNotes: () => {
        const { data, isLoading } = useRemoteNotes();
    
        console.log("notes", data, isLoading);


        //Step 1. Now we will fetch the list of notes in our db

        //Step 2. Compare the remote notes with the local notes. If local notes are the latest then skip it. If remote notes are the latest then update the local notes.

        // Step 3. Push the changes into the local db

        

    }
};
