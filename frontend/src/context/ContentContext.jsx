import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { DEFAULT_CONTENT } from "../data/defaultContent";
import { API } from "../lib/api";

const ContentContext = createContext(DEFAULT_CONTENT);
export const useContent = () => useContext(ContentContext);

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

// Deep-merge saved content over defaults so the site never breaks on missing keys.
export const mergeContent = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] =
      isObj(base[k]) && isObj(over[k]) ? mergeContent(base[k], over[k]) : over[k];
  }
  return out;
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    axios
      .get(`${API}/content`)
      .then(({ data }) => setContent(mergeContent(DEFAULT_CONTENT, data)))
      .catch(() => {});
  }, []);

  return (
    <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
  );
};
