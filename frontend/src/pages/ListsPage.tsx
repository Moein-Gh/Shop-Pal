import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { AnimatePresence, motion } from "motion/react";
import { activeListIdAtom } from "../atoms/lists";
import { useGetLists, useGetItemsByList, useCheckItem, useUncheckItem, useDeleteItem, useGetInvitations } from "../api/hooks";
import { BottomNavbar } from "../components/BottomNavbar";
import { AddItemDialog } from "../components/AddItemDialog";
import { AddListDialog } from "../components/AddListDialog";
import { ListSettingsSheet } from "../components/ListSettingsSheet";
import { ListHeader } from "../components/ListHeader";
import { ItemList } from "../components/ItemList";
import { ProfileTab } from "../components/ProfileTab";
import { ChatSheet } from "../components/ChatSheet";
import type { Item } from "../types";

export default function ListsPage() {
  const [activeListId, setActiveListId] = useAtom(activeListIdAtom);
  const navigate = useNavigate();

  const [navTab, setNavTab] = useState<"lists" | "profile">("lists");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addListOpen, setAddListOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const { data: invitations } = useGetInvitations();
  const { data: userLists, isLoading: listsLoading } = useGetLists();
  const { data: items, isLoading: itemsLoading } = useGetItemsByList(activeListId);

  const checkItem = useCheckItem();
  const uncheckItem = useUncheckItem();
  const deleteItem = useDeleteItem();

  useEffect(() => {
    if (!activeListId && userLists && userLists.length > 0) {
      setActiveListId(userLists[0].List.id);
    }
  }, [userLists, activeListId, setActiveListId]);

  useEffect(() => { setActiveCategory(null); }, [activeListId]);

  const handleToggleCheck = (item: Item) => {
    if (item.checked) uncheckItem.mutate(item.id);
    else checkItem.mutate(item.id);
  };

  const activeList = userLists?.find((ul) => ul.List.id === activeListId);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (navTab === "profile") {
    return <ProfileTab onTabChange={setNavTab} onChatClick={() => { setNavTab("lists"); setChatOpen(true); }} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col pb-28 transition-all duration-300"
      style={{ paddingRight: isDesktop && chatOpen ? "24rem" : undefined }}
    >
      <AnimatePresence>
        {listPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-45 backdrop-blur-sm bg-black/10"
            onPointerDown={() => setListPickerOpen(false)}
          />
        )}
      </AnimatePresence>

      <ListHeader
        userLists={userLists}
        activeListId={activeListId}
        listsLoading={listsLoading}
        listPickerOpen={listPickerOpen}
        onListPickerToggle={() => {
          if (!userLists || userLists.length === 0) setAddListOpen(true);
          else setListPickerOpen((v) => !v);
        }}
        onListPickerClose={() => setListPickerOpen(false)}
        onSelectList={(id) => { setActiveListId(id); setListPickerOpen(false); }}
        onNewList={() => { setListPickerOpen(false); setAddListOpen(true); }}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-2 flex flex-col">
        <ItemList
          activeListId={activeListId}
          listsLoading={listsLoading}
          itemsLoading={itemsLoading}
          items={items}
          activeCategory={activeCategory}
          onCategoryFilter={setActiveCategory}
          onToggleCheck={handleToggleCheck}
          onDeleteItem={(id) => deleteItem.mutate(id)}
          onNavigateItem={(id) => navigate(`/items/${id}`)}
          onCreateList={() => setAddListOpen(true)}
        />
      </div>

      <BottomNavbar
        activeTab={navTab}
        onTabChange={setNavTab}
        onAddClick={() => setAddItemOpen(true)}
        onChatClick={() => setChatOpen(true)}
        chatOpen={chatOpen}
        pendingInvitations={invitations?.length ?? 0}
      />

      <ChatSheet
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        activeListId={activeListId}
        activeListName={activeList?.List.name}
      />

      {activeListId && activeList && (
        <>
          <AddItemDialog
            open={addItemOpen}
            onOpenChange={setAddItemOpen}
            listId={activeListId}
          />
          <ListSettingsSheet
            listId={activeListId}
            listName={activeList.List.name}
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            onDeleted={() => setActiveListId(null)}
          />
        </>
      )}

      <AddListDialog
        open={addListOpen}
        onOpenChange={setAddListOpen}
        onCreated={setActiveListId}
      />
    </div>
  );
}
