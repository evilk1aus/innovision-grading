import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from 'react'

import Button from '../components/Button.jsx';
import ErrorDialogModal from "../components/ErrorDialogModal";

import { sha256 } from 'js-sha256';
import { randomString } from "../Util.js";

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)

const Index = () => {
  const navigate = useNavigate();
  const [errorLog, setErrorLog] = useState(null);
  const [formData, setFormData] = useState({"username": "", "password": ""})

  const changeForm = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  const submitForm = async () => {
    if (formData.username.length == 0) {
      setErrorLog("Empty username!");
      return
    }
    if (formData.password.length == 0) {
      setErrorLog("Empty password!");
      return
    }

    await fetchUser();
  }

  const fetchUser = async () => {
    const { data, error } = await supabase
      .from('Panelists')
      .select("*")
      .eq("username", formData.username)
    if (error) {
      setErrorLog(error["code"] + " - " + error["message"]);
      return
    }
    if (data.length == 0) {
      setErrorLog("Invalid credentials!");
      return
    }

    console.log(data)

    if (formData.password != data[0].password) {
      setErrorLog("Invalid credentials!");
      return
    }
    console.log("Credentials are valid!")
    if (formData.username == "admin") {
      console.log("Special access!")
    }

    const sessionId = randomString(128);
    const sessionIdHash = sha256(sessionId);

    const params = await supabase
      .from('Panelists')
      .update({ session_id: sessionIdHash })
      .eq("username", formData.username);

    if (params.error) {
      setErrorLog("Error updating session id: " + params.error["code"] + " - " + params.error["message"]);
      return
    }

    navigate('/grading', {
      state: {
        sessionId: sessionId,
        userId: data[0].id,
        categoryId: data[0].category_id,
        username: formData.username,
        fullName: data[0].full_name,
      }
    })
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900 w-screen">
        <div className="flex flex-row justify-center pt-16">
          <h2 className="text-blue-300 text-4xl">Login</h2>
        </div>
        <div className="m-auto">
            <label className="block text-sm font-medium text-gray-100">Username</label>
            <input
              type='text'
              name='username'
              className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md"
              value={formData["username"]}
              onChange={changeForm}
              required
            />
            <label className="block text-sm font-medium text-gray-100 pt-4">Password</label>
            <input
              type='password'
              name='password'
              className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md"
              value={formData["password"]}
              onChange={changeForm}
              required
            />
          <div className="flex flex-row justify-center pt-8">
            <Button type="button" onClick={submitForm}>Submit</Button>
          </div>
        </div>
      </div>
      {errorLog != null && (
          <ErrorDialogModal
              buttonText='Ok'
              message='An error occured. Please check the error message below.' 
              errorLog={errorLog}
              onClick={() => setErrorLog(null) }
          />
      )}
    </>
  )
}

export default Index
