
const client = window.supabaseClient;

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");

const loginMessage = document.getElementById("loginMessage");
const formMessage = document.getElementById("formMessage");

let produtosAdmin = [];

function msg(el, tipoTexto, tipo) {
    el.textContent = tipoTexto || "";
    el.className = "message" + (tipo ? " " + tipo : "");
}

function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[c]));
}

function money(v) {
    return v === null || v === undefined || v === ""
        ? "Consulte o preço"
        : Number(v).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
}

async function verificarAcesso() {
    if (!client) {
        msg(
            loginMessage,
            "Configure a URL e a chave pública em js/supabase-config.js.",
            "error"
        );
        return;
    }

    const { data: { session } } = await client.auth.getSession();

    if (!session) {
        loginView.hidden = false;
        dashboardView.hidden = true;
        return;
    }

    const { data: { user } } = await client.auth.getUser();

    if (user?.app_metadata?.role !== "admin") {
        await client.auth.signOut();

        msg(
            loginMessage,
            "Este usuário não tem permissão de administrador.",
            "error"
        );

        return;
    }

    loginView.hidden = true;
    dashboardView.hidden = false;

    await carregarLista();
}

document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();

    if (!client) return;

    msg(loginMessage, "Verificando acesso...");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        msg(
            loginMessage,
            "Não foi possível entrar. Confira e-mail e senha.",
            "error"
        );
        return;
    }

    await verificarAcesso();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await client.auth.signOut();

    loginView.hidden = false;
    dashboardView.hidden = true;
});

function limpar() {
    document.getElementById("productForm").reset();

    document.getElementById("productId").value = "";
    document.getElementById("productActive").checked = true;

    document.getElementById("formTitle").textContent = "Adicionar produto";
    document.getElementById("cancelEditBtn").hidden = true;

    msg(formMessage, "");
}

document.getElementById("cancelEditBtn").addEventListener("click", limpar);

async function carregarLista() {
    const box = document.getElementById("adminProductsList");

    box.innerHTML = "<p>Carregando produtos...</p>";

    const { data, error } = await client
        .from("produtos")
        .select("*")
        .order("sort_order")
        .order("created_at");

    if (error) {
        box.innerHTML = "<p>Erro ao carregar. Confira se executou supabase.sql.</p>";
        return;
    }

    produtosAdmin = data || [];

    document.getElementById("productCount").textContent =
        `${produtosAdmin.length} produto(s)`;

    if (!produtosAdmin.length) {
        box.innerHTML = "<p>Nenhum produto cadastrado.</p>";
        return;
    }

    box.innerHTML = produtosAdmin.map(p => `
        <article class="admin-product">
            <img src="${esc(p.image_url)}" alt="">

            <div>
                <h3>${esc(p.name)}</h3>
                <p>${esc(p.description)}</p>
                <p class="price">
                    ${money(p.price)} ${esc(p.price_unit)}
                </p>

                ${p.active ? "" : '<span class="status-hidden">Oculto na loja</span>'}
            </div>

            <div class="product-actions">
                <button class="small-btn" data-edit="${p.id}">
                    Editar
                </button>

                <button class="small-btn delete" data-delete="${p.id}">
                    Excluir
                </button>
            </div>
        </article>
    `).join("");

    box.querySelectorAll("[data-edit]").forEach(b => {
        b.addEventListener("click", () => editar(b.dataset.edit));
    });

    box.querySelectorAll("[data-delete]").forEach(b => {
        b.addEventListener("click", () => excluir(b.dataset.delete));
    });
}

function editar(id) {
    const p = produtosAdmin.find(x => x.id === id);

    if (!p) return;

    document.getElementById("productId").value = p.id;
    document.getElementById("productName").value = p.name;

    document.getElementById("productDescription").value =
        p.description || "";

    document.getElementById("productPrice").value =
        p.price ?? "";

    document.getElementById("productPriceUnit").value =
        p.price_unit || "";

    document.getElementById("productFlavors").value =
        (p.flavors || []).join(", ");

    document.getElementById("productImageUrl").value =
        p.image_url || "";

    document.getElementById("productActive").checked =
        !!p.active;

    document.getElementById("formTitle").textContent =
        "Editar produto";

    document.getElementById("cancelEditBtn").hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function upload(file) {
    if (!file) return null;

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const ext = (file.name.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await client.storage
        .from("produtos")
        .upload(path, file, {
            contentType: file.type
        });

    if (error) throw error;

    return client.storage
        .from("produtos")
        .getPublicUrl(path).data.publicUrl;
}

document.getElementById("productForm").addEventListener("submit", async e => {
    e.preventDefault();

    msg(formMessage, "Salvando produto...");

    try {
        const id = document.getElementById("productId").value;

        const file = document.getElementById("productImage").files[0];

        let image = document.getElementById("productImageUrl").value.trim();

        if (file) {
            image = await upload(file);
        }

        if (!image && id) {
            image = produtosAdmin.find(p => p.id === id)?.image_url || "";
        }

        if (!image) {
            throw new Error("Informe um link ou selecione uma imagem.");
        }

        const raw = document.getElementById("productPrice").value;

        const data = {
            name: document.getElementById("productName").value.trim(),

            description: document.getElementById("productDescription").value.trim(),

            price: raw === "" ? null : Number(raw),

            price_unit: document.getElementById("productPriceUnit").value.trim(),

            flavors: document.getElementById("productFlavors").value
                .split(",")
                .map(x => x.trim())
                .filter(Boolean),

            image_url: image,

            active: document.getElementById("productActive").checked
        };

        if (!data.name) {
            throw new Error("Informe o nome do produto.");
        }

        if (data.price !== null &&
            (!Number.isFinite(data.price) || data.price < 0)) {
            throw new Error("Preço inválido.");
        }

        const result = id
            ? await client.from("produtos").update(data).eq("id", id)
            : await client.from("produtos").insert(data);

        if (result.error) throw result.error;

        limpar();

        msg(formMessage, "Produto salvo com sucesso!", "success");

        await carregarLista();

    } catch (err) {
        msg(
            formMessage,
            err.message || "Erro ao salvar produto.",
            "error"
        );
    }
});

async function excluir(id) {
    const p = produtosAdmin.find(x => x.id === id);

    if (!p || !confirm(`Deseja excluir "${p.name}"?`)) {
        return;
    }

    const { error } = await client
        .from("produtos")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Erro ao excluir: " + error.message);
        return;
    }

    await carregarLista();
}

verificarAcesso();
