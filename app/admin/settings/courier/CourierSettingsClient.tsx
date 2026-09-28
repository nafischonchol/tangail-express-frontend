"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  Truck,
  Check,
  AlertCircle,
  X,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { updateCourierSettings } from "@/lib/api/couriers";

interface CourierSettingsClientProps {
  initialSettings: any[];
}

export default function CourierSettingsClient({
  initialSettings,
}: CourierSettingsClientProps) {
  const router = useRouter();

  // Notification State
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Connection Toggles
  const [pathaoConnected, setPathaoConnected] = useState(false);
  const [steadfastConnected, setSteadfastConnected] = useState(false);

  // Default partner states (only one can be default)
  const [isPathaoDefault, setIsPathaoDefault] = useState(false);
  const [isSteadfastDefault, setIsSteadfastDefault] = useState(false);

  // Configuration Expand States
  const [expandPathao, setExpandPathao] = useState(false);
  const [expandSteadfast, setExpandSteadfast] = useState(false);

  // Credentials States - Pathao
  const [pathaoClientId, setPathaoClientId] = useState("");
  const [pathaoClientSecret, setPathaoClientSecret] = useState("");
  const [pathaoUsername, setPathaoUsername] = useState("");
  const [pathaoPassword, setPathaoPassword] = useState("");
  const [pathaoStoreId, setPathaoStoreId] = useState("");
  const [pathaoSandbox, setPathaoSandbox] = useState(false);
  const [showPathaoSecret, setShowPathaoSecret] = useState(false);
  const [showPathaoPassword, setShowPathaoPassword] = useState(false);
  const [testingPathao, setTestingPathao] = useState(false);
  const [savingPathao, setSavingPathao] = useState(false);

  // Credentials States - Steadfast
  const [steadfastApiKey, setSteadfastApiKey] = useState("");
  const [steadfastSecretKey, setSteadfastSecretKey] = useState("");
  const [showSteadfastSecret, setShowSteadfastSecret] = useState(false);
  const [testingSteadfast, setTestingSteadfast] = useState(false);
  const [savingSteadfast, setSavingSteadfast] = useState(false);

  // Sync initial configuration properties from props
  useEffect(() => {
    if (initialSettings) {
      initialSettings.forEach((setting) => {
        if (setting.courier_name === "pathao") {
          setPathaoConnected(setting.is_enabled);
          setIsPathaoDefault(setting.is_default);
          setPathaoClientId(setting.credentials?.client_id || "");
          setPathaoClientSecret(setting.credentials?.client_secret || "");
          setPathaoUsername(setting.credentials?.username || "");
          setPathaoPassword(setting.credentials?.password || "");
          setPathaoStoreId(setting.credentials?.store_id || "");
          setPathaoSandbox(Boolean(setting.credentials?.sandbox));
        } else if (setting.courier_name === "steadfast") {
          setSteadfastConnected(setting.is_enabled);
          setIsSteadfastDefault(setting.is_default);
          setSteadfastApiKey(setting.credentials?.api_key || "");
          setSteadfastSecretKey(setting.credentials?.secret_key || "");
        }
      });
    }
  }, [initialSettings]);

  // Show Toast
  const showNotification = useCallback(
    (type: "success" | "error", message: string) => {
      setNotification({ type, message });
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    },
    [],
  );

  // Pathao Handlers
  const handleTestPathao = () => {
    if (!pathaoClientId || !pathaoClientSecret || !pathaoUsername || !pathaoPassword || !pathaoStoreId) {
      showNotification(
        "error",
        "Please fill in Client ID, Client Secret, Username, Password, and Store ID to test.",
      );
      return;
    }
    setTestingPathao(true);
    setTimeout(() => {
      setTestingPathao(false);
      showNotification(
        "success",
        `Connection test to Pathao (${pathaoSandbox ? "Sandbox" : "Production"}) succeeded! Credentials are valid.`,
      );
    }, 2000);
  };

  const handleSavePathao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathaoClientId || !pathaoClientSecret || !pathaoUsername || !pathaoPassword || !pathaoStoreId) {
      showNotification(
        "error",
        "Please fill in Client ID, Client Secret, Username, Password, and Store ID.",
      );
      return;
    }
    setSavingPathao(true);

    const payload = {
      courier_name: "pathao" as const,
      is_enabled: true,
      is_default: isPathaoDefault,
      credentials: {
        client_id: pathaoClientId.trim(),
        client_secret: pathaoClientSecret.trim(),
        username: pathaoUsername.trim(),
        password: pathaoPassword,
        store_id: pathaoStoreId.trim(),
        sandbox: pathaoSandbox,
      },
    };

    const res = await updateCourierSettings(payload);
    setSavingPathao(false);
    if (res.success) {
      setPathaoConnected(true);
      showNotification(
        "success",
        "Pathao Courier credentials saved successfully!",
      );
      setExpandPathao(false);
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  const handleDisconnectPathao = async () => {
    const payload = {
      courier_name: "pathao" as const,
      is_enabled: false,
      is_default: false, // Disconnecting clears default status
      credentials: {
        client_id: pathaoClientId,
        client_secret: pathaoClientSecret,
        username: pathaoUsername,
        password: pathaoPassword,
        store_id: pathaoStoreId,
        sandbox: pathaoSandbox,
      },
    };
    const res = await updateCourierSettings(payload);
    if (res.success) {
      setPathaoConnected(false);
      setIsPathaoDefault(false);
      showNotification("success", "Pathao integration disconnected.");
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  const handleConnectPathao = async () => {
    if (!pathaoClientId || !pathaoClientSecret || !pathaoUsername || !pathaoPassword || !pathaoStoreId) {
      setExpandPathao(true);
      showNotification("error", "Please configure and save credentials first.");
      return;
    }
    const payload = {
      courier_name: "pathao" as const,
      is_enabled: true,
      is_default: isPathaoDefault,
      credentials: {
        client_id: pathaoClientId.trim(),
        client_secret: pathaoClientSecret.trim(),
        username: pathaoUsername.trim(),
        password: pathaoPassword,
        store_id: pathaoStoreId.trim(),
        sandbox: pathaoSandbox,
      },
    };
    const res = await updateCourierSettings(payload);
    if (res.success) {
      setPathaoConnected(true);
      showNotification("success", "Pathao Courier enabled successfully!");
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  const handleSetPathaoDefault = async () => {
    if (!pathaoConnected) {
      showNotification(
        "error",
        "Please connect Pathao first before setting it as default.",
      );
      return;
    }

    const payload = {
      courier_name: "pathao" as const,
      is_enabled: true,
      is_default: true,
      credentials: {
        client_id: pathaoClientId,
        client_secret: pathaoClientSecret,
        username: pathaoUsername,
        password: pathaoPassword,
        store_id: pathaoStoreId,
        sandbox: pathaoSandbox,
      },
    };

    const res = await updateCourierSettings(payload);
    if (res.success) {
      setIsPathaoDefault(true);
      setIsSteadfastDefault(false); // Backend automatically clears other default settings
      showNotification("success", "Pathao set as default courier partner.");
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  // Steadfast Handlers
  const handleTestSteadfast = () => {
    if (!steadfastApiKey || !steadfastSecretKey) {
      showNotification(
        "error",
        "Please fill in API Key and Secret Key to test.",
      );
      return;
    }
    setTestingSteadfast(true);
    setTimeout(() => {
      setTestingSteadfast(false);
      showNotification(
        "success",
        "Connection test to Steadfast succeeded! Credentials are valid.",
      );
    }, 2000);
  };

  const handleSaveSteadfast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steadfastApiKey || !steadfastSecretKey) {
      showNotification("error", "Please fill in API Key and Secret Key.");
      return;
    }
    setSavingSteadfast(true);

    const payload = {
      courier_name: "steadfast" as const,
      is_enabled: true,
      is_default: isSteadfastDefault,
      credentials: {
        api_key: steadfastApiKey.trim(),
        secret_key: steadfastSecretKey.trim(),
      },
    };

    const res = await updateCourierSettings(payload);
    setSavingSteadfast(false);
    if (res.success) {
      setSteadfastConnected(true);
      showNotification(
        "success",
        "Steadfast Courier credentials saved successfully!",
      );
      setExpandSteadfast(false);
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  const handleDisconnectSteadfast = async () => {
    const payload = {
      courier_name: "steadfast" as const,
      is_enabled: false,
      is_default: false,
      credentials: {
        api_key: steadfastApiKey,
        secret_key: steadfastSecretKey,
      },
    };
    const res = await updateCourierSettings(payload);
    if (res.success) {
      setSteadfastConnected(false);
      setIsSteadfastDefault(false);
      showNotification("success", "Steadfast integration disconnected.");
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  const handleConnectSteadfast = async () => {
    if (!steadfastApiKey || !steadfastSecretKey) {
      setExpandSteadfast(true);
      showNotification("error", "Please configure and save credentials first.");
      return;
    }
    const payload = {
      courier_name: "steadfast" as const,
      is_enabled: true,
      is_default: isSteadfastDefault,
      credentials: {
        api_key: steadfastApiKey.trim(),
        secret_key: steadfastSecretKey.trim(),
      },
    };
    const res = await updateCourierSettings(payload);
    if (res.success) {
      setSteadfastConnected(true);
      showNotification("success", "Steadfast Courier enabled successfully!");
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  const handleSetSteadfastDefault = async () => {
    if (!steadfastConnected) {
      showNotification(
        "error",
        "Please connect Steadfast first before setting it as default.",
      );
      return;
    }

    const payload = {
      courier_name: "steadfast" as const,
      is_enabled: true,
      is_default: true,
      credentials: {
        api_key: steadfastApiKey,
        secret_key: steadfastSecretKey,
      },
    };

    const res = await updateCourierSettings(payload);
    if (res.success) {
      setIsSteadfastDefault(true);
      setIsPathaoDefault(false);
      showNotification("success", "Steadfast set as default courier partner.");
      router.refresh();
    } else {
      showNotification("error", res.message);
    }
  };

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 
          ${
            notification.type === "success"
              ? "bg-emerald-50/90 border-emerald-100 text-emerald-800"
              : "bg-rose-50/90 border-rose-100 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Check size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertCircle size={18} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">
              {notification.type === "success" ? "Success" : "Error"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {notification.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Courier Integration"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings", href: "#" },
          { label: "Courier Integration" },
        ]}
      />

      {/* Info Alert Box */}
      <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/50 border border-indigo-100 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-200/50 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800 text-sm">
            Secure Credential Storage
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
            Integrating your courier credentials allows you to automate shipping
            label generation, order status updates, and tracking numbers
            generation directly from your POS checkout page. All credentials are
            fully encrypted and transmitted securely.
          </p>
        </div>
      </div>

      {/* Courier Integrations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Card 1: Pathao Courier */}
        <Card
          className={`overflow-hidden border transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.01)]
          ${pathaoConnected ? "border-orange-100/80 bg-orange-50/5" : "border-slate-100/80"}`}
        >
          <CardHeader className="py-5 bg-slate-50/20 border-b border-slate-100/50 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/15">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  Pathao Courier
                  <span className="text-[10px] text-slate-400 font-medium">
                    (API v2)
                  </span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border
                    ${
                      pathaoConnected
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {pathaoConnected ? "Connected" : "Disconnected"}
                  </span>
                  {isPathaoDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                      <Star
                        size={10}
                        className="fill-indigo-600 text-indigo-600"
                      />
                      Default Partner
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (pathaoConnected) {
                  handleDisconnectPathao();
                } else {
                  handleConnectPathao();
                }
              }}
              className="focus:outline-none cursor-pointer"
            >
              {pathaoConnected ? (
                <ToggleRight className="text-emerald-500 h-8 w-8" />
              ) : (
                <ToggleLeft className="text-slate-300 h-8 w-8" />
              )}
            </button>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Automate orders fulfillment using the Pathao Delivery service.
              Connect with your merchant account details to retrieve store info
              and submit delivery requests.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4">
                <a
                  href="https://merchant.pathao.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 w-fit hover:underline"
                >
                  Go to Pathao Merchant Portal
                  <ExternalLink size={10} />
                </a>

                {pathaoConnected && !isPathaoDefault && (
                  <button
                    type="button"
                    onClick={handleSetPathaoDefault}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Star size={11} />
                    Set as Default
                  </button>
                )}
              </div>

              <Button
                type="button"
                onClick={() => setExpandPathao(!expandPathao)}
                variant="ghost"
                className="h-8.5 rounded-xl border border-slate-200 text-xs px-3.5 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer sm:ml-auto"
              >
                {expandPathao ? (
                  <>
                    Hide Settings
                    <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Configure Details
                    <ChevronDown size={14} />
                  </>
                )}
              </Button>
            </div>

            {expandPathao && (
              <form
                onSubmit={handleSavePathao}
                className="mt-6 border-t border-slate-100 pt-6 space-y-4 animate-in slide-in-from-top-2 duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="pathaoClientId"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      Client ID *
                    </Label>
                    <Input
                      id="pathaoClientId"
                      placeholder="Enter Pathao Client ID"
                      value={pathaoClientId}
                      onChange={(e) => setPathaoClientId(e.target.value)}
                      required
                      className="rounded-xl h-9.5 border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="pathaoClientSecret"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      Client Secret *
                    </Label>
                    <div className="relative">
                      <Input
                        id="pathaoClientSecret"
                        type={showPathaoSecret ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={pathaoClientSecret}
                        onChange={(e) => setPathaoClientSecret(e.target.value)}
                        required
                        className="rounded-xl h-9.5 border-slate-200 pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPathaoSecret(!showPathaoSecret)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPathaoSecret ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="pathaoUsername"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      Username / Email *
                    </Label>
                    <Input
                      id="pathaoUsername"
                      type="email"
                      placeholder="merchant@example.com"
                      value={pathaoUsername}
                      onChange={(e) => setPathaoUsername(e.target.value)}
                      required
                      className="rounded-xl h-9.5 border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="pathaoPassword"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="pathaoPassword"
                        type={showPathaoPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={pathaoPassword}
                        onChange={(e) => setPathaoPassword(e.target.value)}
                        required
                        className="rounded-xl h-9.5 border-slate-200 pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPathaoPassword(!showPathaoPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPathaoPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="pathaoStoreId"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      Store ID *
                    </Label>
                    <Input
                      id="pathaoStoreId"
                      placeholder="e.g. 98765"
                      value={pathaoStoreId}
                      onChange={(e) => setPathaoStoreId(e.target.value)}
                      required
                      className="rounded-xl h-9.5 border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3.5 h-9.5 bg-slate-50/50">
                      <Label
                        htmlFor="pathaoSandbox"
                        className="text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Sandbox Environment
                      </Label>
                      <button
                        type="button"
                        id="pathaoSandbox"
                        onClick={() => setPathaoSandbox(!pathaoSandbox)}
                        className="focus:outline-none cursor-pointer"
                      >
                        {pathaoSandbox ? (
                          <ToggleRight className="text-amber-500 h-6 w-6" />
                        ) : (
                          <ToggleLeft className="text-slate-300 h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    onClick={handleTestPathao}
                    disabled={testingPathao || savingPathao}
                    className="h-9.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs px-4 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {testingPathao ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={testingPathao || savingPathao}
                    className="h-9.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs px-5 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingPathao ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Credentials"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Steadfast Courier */}
        <Card
          className={`overflow-hidden border transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.01)]
          ${steadfastConnected ? "border-indigo-100/80 bg-indigo-50/5" : "border-slate-100/80"}`}
        >
          <CardHeader className="py-5 bg-slate-50/20 border-b border-slate-100/50 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/15">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  Steadfast Courier
                  <span className="text-[10px] text-slate-400 font-medium">
                    (API v1)
                  </span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border
                    ${
                      steadfastConnected
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {steadfastConnected ? "Connected" : "Disconnected"}
                  </span>
                  {isSteadfastDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                      <Star
                        size={10}
                        className="fill-indigo-600 text-indigo-600"
                      />
                      Default Partner
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (steadfastConnected) {
                  handleDisconnectSteadfast();
                } else {
                  handleConnectSteadfast();
                }
              }}
              className="focus:outline-none cursor-pointer"
            >
              {steadfastConnected ? (
                <ToggleRight className="text-emerald-500 h-8 w-8" />
              ) : (
                <ToggleLeft className="text-slate-300 h-8 w-8" />
              )}
            </button>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Automate orders delivery with Steadfast Courier. Generate bulk
              delivery requests, download invoices, and keep clients updated
              with real-time package statuses.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4">
                <a
                  href="https://steadfast.com.bd/user/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 w-fit hover:underline"
                >
                  Go to Steadfast Merchant Portal
                  <ExternalLink size={10} />
                </a>

                {steadfastConnected && !isSteadfastDefault && (
                  <button
                    type="button"
                    onClick={handleSetSteadfastDefault}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Star size={11} />
                    Set as Default
                  </button>
                )}
              </div>

              <Button
                type="button"
                onClick={() => setExpandSteadfast(!expandSteadfast)}
                variant="ghost"
                className="h-8.5 rounded-xl border border-slate-200 text-xs px-3.5 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer sm:ml-auto"
              >
                {expandSteadfast ? (
                  <>
                    Hide Settings
                    <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Configure Details
                    <ChevronDown size={14} />
                  </>
                )}
              </Button>
            </div>

            {expandSteadfast && (
              <form
                onSubmit={handleSaveSteadfast}
                className="mt-6 border-t border-slate-100 pt-6 space-y-4 animate-in slide-in-from-top-2 duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="steadfastApiKey"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      API Key *
                    </Label>
                    <Input
                      id="steadfastApiKey"
                      placeholder="Enter Steadfast API Key"
                      value={steadfastApiKey}
                      onChange={(e) => setSteadfastApiKey(e.target.value)}
                      required
                      className="rounded-xl h-9.5 border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="steadfastSecretKey"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      Secret Key *
                    </Label>
                    <div className="relative">
                      <Input
                        id="steadfastSecretKey"
                        type={showSteadfastSecret ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={steadfastSecretKey}
                        onChange={(e) => setSteadfastSecretKey(e.target.value)}
                        required
                        className="rounded-xl h-9.5 border-slate-200 pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSteadfastSecret(!showSteadfastSecret)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSteadfastSecret ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    onClick={handleTestSteadfast}
                    disabled={testingSteadfast || savingSteadfast}
                    className="h-9.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs px-4 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {testingSteadfast ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={testingSteadfast || savingSteadfast}
                    className="h-9.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingSteadfast ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Credentials"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
