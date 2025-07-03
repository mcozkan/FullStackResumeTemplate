import React, { useState, useEffect } from "react";

const API = import.meta.env.PROD 
  ? "https://your-backend-url.railway.app/api"  // Replace with your actual backend URL
  : "http://localhost:8000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [view, setView] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [newProject, setNewProject] = useState({ title: "", description: "", tech: "", github: "", download: "", readmore: "" });
  const [newPost, setNewPost] = useState({ title: "", excerpt: "", date: "", link: "" });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [editingPolicy, setEditingPolicy] = useState(false);
  const [policyDraft, setPolicyDraft] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: "" });
  const [newSkillIcon, setNewSkillIcon] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [editProjectId, setEditProjectId] = useState(null);
  const [editPostId, setEditPostId] = useState(null);
  const [newProjectImage, setNewProjectImage] = useState(null);
  const [about, setAbout] = useState({ text: '', years_experience: '' });
  const [aboutDraft, setAboutDraft] = useState({ text: '', years_experience: '' });
  const [editingAbout, setEditingAbout] = useState(false);
  

  // Fetch data
  useEffect(() => {
    if (token) {
      fetch(`${API}/projects`).then(r => r.json()).then(setProjects);
      fetch(`${API}/medium-posts`).then(r => r.json()).then(setPosts);
      fetch(`${API}/skills`).then(r => r.json()).then(setSkills);
      fetch(`${API}/about`).then(r => r.json()).then(setAbout);
    }
  }, [token]);

  // Fetch profile photo and privacy policy on mount or token change
  useEffect(() => {
    if (token) {
      fetch(`${API}/profile-photo-url`)
        .then(r => r.json())
        .then(data => {
          if (data.image_url) {
            setProfilePhotoUrl(`http://localhost:8000/${data.image_url}`);
          }
        });
      fetch(`${API}/privacy-policy`)
        .then(r => r.json())
        .then(data => setPrivacyPolicy(data.policy || ""));
    }
  }, [token]);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const form = new FormData();
    form.append("username", login.username);
    form.append("password", login.password);
    const res = await fetch(`${API}/login`, { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("token", data.token);
    } else {
      let msg = "Login failed";
      try {
        const err = await res.json();
        if (err.detail) msg = err.detail;
      } catch {
        // Ignore JSON parse errors, fallback to default message
      }
      setLoginError(msg);
    }
  };

  // Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(newProject).forEach(([k, v]) => form.append(k, v));
    if (newProjectImage) form.append('image', newProjectImage);
    const res = await fetch(`${API}/projects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      setProjects([...projects, await res.json()]);
      setNewProject({ title: "", description: "", tech: "", github: "", download: "", readmore: "" });
      setNewProjectImage(null);
    } else {
      alert("Failed to add project");
    }
  };

  // Delete Project
  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await fetch(`${API}/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setProjects(projects.filter(p => p.id !== id));
  };

  // Add Medium Post
  const handleAddPost = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(newPost).forEach(([k, v]) => form.append(k, v));
    const res = await fetch(`${API}/medium-posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      setPosts([...posts, await res.json()]);
      setNewPost({ title: "", excerpt: "", date: "", link: "" });
    } else {
      alert("Failed to add post");
    }
  };

  // Delete Medium Post
  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await fetch(`${API}/medium-posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(posts.filter(p => p.id !== id));
  };

  // Edit Medium Post
  const handleEditPost = (post) => {
    setEditPostId(post.id);
    setNewPost({
      title: post.title || '',
      excerpt: post.excerpt || '',
      date: post.date || '',
      link: post.link || ''
    });
  };

  // Update Medium Post
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(newPost).forEach(([k, v]) => form.append(k, v));
    const res = await fetch(`${API}/medium-posts/${editPostId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(posts.map(p => p.id === editPostId ? updated : p));
      setEditPostId(null);
      setNewPost({ title: "", excerpt: "", date: "", link: "" });
    } else {
      alert("Failed to update post");
    }
  };

  const handleProfilePhotoChange = async (e) => {
    e.preventDefault();
    if (!profilePhoto) {
      alert("Please select a file.");
      return;
    }
    const form = new FormData();
    form.append("image", profilePhoto);
    const res = await fetch(`${API}/profile-photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      setProfilePhotoUrl(`http://localhost:8000/${data.image_url}`);
      setProfilePhoto(null);
      alert("Profile photo updated!");
    } else {
      alert("Failed to update profile photo");
    }
  };

  const handleEditPolicy = () => {
    setPolicyDraft(privacyPolicy);
    setEditingPolicy(true);
  };

  const handleSavePolicy = async () => {
    const res = await fetch(`${API}/privacy-policy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ policy: policyDraft }),
    });
    if (res.ok) {
      setPrivacyPolicy(policyDraft);
      setEditingPolicy(false);
      alert("Privacy policy updated!");
    } else {
      alert("Failed to update privacy policy");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", newSkill.name);
    if (newSkillIcon) form.append("icon", newSkillIcon);
    const res = await fetch(`${API}/skills`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      setSkills([...skills, await res.json()]);
      setNewSkill({ name: "" });
      setNewSkillIcon(null);
    } else {
      alert("Failed to add skill");
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    await fetch(`${API}/skills/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSkills(skills.filter(s => s.id !== id));
  };

  // Edit Project
  const handleEditProject = (project) => {
    setEditProjectId(project.id);
    setNewProject({
      title: project.title || '',
      description: project.description || '',
      tech: project.tech || '',
      github: project.github || '',
      download: project.download || '',
      readmore: project.readmore || ''
    });
    setNewProjectImage(null);
  };

  // Update Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(newProject).forEach(([k, v]) => form.append(k, v));
    if (newProjectImage) form.append('image', newProjectImage);
    const res = await fetch(`${API}/projects/${editProjectId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(projects.map(p => p.id === editProjectId ? updated : p));
      setEditProjectId(null);
      setNewProject({ title: "", description: "", tech: "", github: "", download: "", readmore: "" });
      setNewProjectImage(null);
    } else {
      alert("Failed to update project");
    }
  };

  const handleEditAbout = () => {
    setAboutDraft(about);
    setEditingAbout(true);
  };

  const handleSaveAbout = async () => {
    const form = new FormData();
    form.append('text', aboutDraft.text);
    form.append('years_experience', aboutDraft.years_experience);
    const res = await fetch(`${API}/about`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      setAbout(aboutDraft);
      setEditingAbout(false);
      alert('About section updated!');
    } else {
      alert('Failed to update about section');
    }
  };

  const handleMoveProject = async (index, direction) => {
    const newProjects = [...projects];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;
    // Swap
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    setProjects(newProjects);
    // Send new order to backend
    const order = newProjects.map(p => p.id);
    await fetch(`${API}/projects/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ order })
    });
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <h2 style={{ textAlign: 'center' }}>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input placeholder="Username" value={login.username} onChange={e => setLogin({ ...login, username: e.target.value })} style={{ width: '100%', marginBottom: 10 }} /><br />
            <input type="password" placeholder="Password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} style={{ width: '100%', marginBottom: 10 }} /><br />
            <button style={{ width: '100%' }}>Login</button>
          </form>
          {loginError && <div style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{loginError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>Admin Panel</h1>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => window.location.href = '/main_page.html'}>Go to Site</button>
        <button onClick={() => setView("projects")}>Projects</button>
        <button onClick={() => setView("posts")}>Medium Posts</button>
        <button onClick={() => setView("skills")}>Skills</button>
        <button onClick={() => setView("privacy")}>Privacy Policy</button>
        <button onClick={() => setView("about")}>About</button>
        <button onClick={() => { setToken(""); localStorage.removeItem("token"); }}>Logout</button>
      </nav>
      {/* Profile Photo Section */}
      <div style={{ marginBottom: 20 }}>
        <h2>Profile Photo</h2>
        {profilePhotoUrl && (
          <img src={profilePhotoUrl} alt="Profile" style={{ height: 80, borderRadius: "50%" }} />
        )}
        <form onSubmit={handleProfilePhotoChange} encType="multipart/form-data">
          <input
            type="file"
            accept="image/*"
            onChange={e => setProfilePhoto(e.target.files[0])}
          />
          <button type="submit">Change Photo</button>
        </form>
      </div>
      {/* Main Content */}
      {view === "projects" && (
        <>
          <h2>Projects</h2>
          <form onSubmit={editProjectId ? handleUpdateProject : handleAddProject} encType="multipart/form-data">
            <input placeholder="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} required />
            <input placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} required />
            <input placeholder="Tech (comma separated)" value={newProject.tech} onChange={e => setNewProject({ ...newProject, tech: e.target.value })} required />
            <input placeholder="GitHub Link" value={newProject.github} onChange={e => setNewProject({ ...newProject, github: e.target.value })} required />
            <input placeholder="Download Link" value={newProject.download} onChange={e => setNewProject({ ...newProject, download: e.target.value })} required />
            <input placeholder="Read More Link" value={newProject.readmore} onChange={e => setNewProject({ ...newProject, readmore: e.target.value })} required />
            <input type="file" accept="image/*" onChange={e => setNewProjectImage(e.target.files[0])} />
            {newProjectImage && (
              <div style={{ margin: '10px 0' }}>
                <img src={URL.createObjectURL(newProjectImage)} alt="Preview" style={{ maxHeight: 100, borderRadius: 8 }} />
              </div>
            )}
            <button>{editProjectId ? "Update Project" : "Add Project"}</button>
            {editProjectId && <button type="button" onClick={() => { setEditProjectId(null); setNewProject({ title: "", description: "", tech: "", github: "", download: "", readmore: "" }); setNewProjectImage(null); }}>Cancel</button>}
          </form>
          <ul>
            {projects.map((p, i) => (
              <li key={p.id}>
                <b>{p.title}</b> ({p.tech})
                <button onClick={() => handleEditProject(p)}>Edit</button>
                <button onClick={() => handleDeleteProject(p.id)}>Delete</button>
                <button onClick={() => handleMoveProject(i, -1)} disabled={i === 0}>Move Up</button>
                <button onClick={() => handleMoveProject(i, 1)} disabled={i === projects.length - 1}>Move Down</button>
              </li>
            ))}
          </ul>
        </>
      )}
      {view === "posts" && (
        <>
          <h2>Medium Posts</h2>
          <form onSubmit={editPostId ? handleUpdatePost : handleAddPost}>
            <input placeholder="Title" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} required />
            <input placeholder="Excerpt" value={newPost.excerpt} onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })} required />
            <input placeholder="Date" value={newPost.date} onChange={e => setNewPost({ ...newPost, date: e.target.value })} required />
            <input placeholder="Medium Link" value={newPost.link} onChange={e => setNewPost({ ...newPost, link: e.target.value })} required />
            <button>{editPostId ? "Update Post" : "Add Post"}</button>
            {editPostId && <button type="button" onClick={() => { setEditPostId(null); setNewPost({ title: "", excerpt: "", date: "", link: "" }); }}>Cancel</button>}
          </form>
          <ul>
            {posts.map(p => (
              <li key={p.id}>
                <b>{p.title}</b> ({p.date})
                <button onClick={() => handleEditPost(p)}>Edit</button>
                <button onClick={() => handleDeletePost(p.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
      {view === "skills" && (
        <div>
          <h2>Skills</h2>
          <form onSubmit={handleAddSkill} encType="multipart/form-data">
            <input placeholder="Skill Name" value={newSkill.name} onChange={e => setNewSkill({ name: e.target.value })} required />
            <input type="file" accept="image/*" onChange={e => setNewSkillIcon(e.target.files[0])} />
            <button>Add Skill</button>
          </form>
          <ul>
            {skills.map(s => (
              <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {s.icon && <img src={`/${s.icon}`} alt={s.name} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }} />}
                <span>{s.name}</span>
                <button onClick={() => handleDeleteSkill(s.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {view === "privacy" && (
        <div>
          <h2>Privacy Policy</h2>
          {!editingPolicy ? (
            <div>
              <pre style={{ background: "#f4f4f4", padding: 10 }}>{privacyPolicy}</pre>
              <button onClick={handleEditPolicy}>Edit</button>
            </div>
          ) : (
            <div>
              <textarea
                value={policyDraft}
                onChange={e => setPolicyDraft(e.target.value)}
                rows={10}
                style={{ width: "100%" }}
              />
              <button onClick={handleSavePolicy}>Save</button>
              <button onClick={() => setEditingPolicy(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}
      {view === "about" && (
        <div>
          <h2>About Section</h2>
          {!editingAbout ? (
            <div>
              <pre style={{ background: "#f4f4f4", padding: 10 }}>{about.text}</pre>
              <div>Years Experience: <b>{about.years_experience}</b></div>
              <button onClick={handleEditAbout}>Edit</button>
            </div>
          ) : (
            <div>
              <textarea
                value={aboutDraft.text}
                onChange={e => setAboutDraft({ ...aboutDraft, text: e.target.value })}
                rows={6}
                style={{ width: "100%" }}
              />
              <input
                type="text"
                placeholder="Years Experience"
                value={aboutDraft.years_experience}
                onChange={e => setAboutDraft({ ...aboutDraft, years_experience: e.target.value })}
                style={{ width: "100%", margin: '10px 0' }}
              />
              <button onClick={handleSaveAbout}>Save</button>
              <button onClick={() => setEditingAbout(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;